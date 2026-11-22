import { z } from 'zod';

import { CONTRIBUTORS_MAX } from './catalog';
import { normalizeIsbn } from './isbn';
import {
  cleanName,
  compact,
  getXml,
  oneOrMore,
  publishedFromText,
  SourceUnavailableError,
} from './isbn-source.server';

import type { BookDraft, ContributorForm } from './catalog';
import type { Isbns } from './isbn';

// NDL Search, the National Diet Library of Japan's, which covers other Japanese libraries too. Its
// terms ask for a credit, and for an application before any use for profit.
// https://ndlsearch.ndl.go.jp/en/help/api
const NDL = 'https://ndlsearch.ndl.go.jp/api/opensearch';
// Several libraries may describe the same book.
const RECORDS_MAX = 5;
// It regularly takes more than ten seconds to answer.
const TIMEOUT_MS = 20_000;

const elements = oneOrMore(z.object({ text: z.string(), 'xsi:type': z.string().optional() }));

const searchItem = z.object({
  author: elements,
  'dc:title': elements,
  'dc:creator': elements,
  'dc:publisher': elements,
  'dc:extent': elements,
  'dc:identifier': elements,
  'dc:subject': elements,
  'dcterms:issued': elements,
  'dcndl:volume': elements,
  'dcndl:edition': elements,
  'dcndl:genre': elements,
});

const searchResponse = z.object({
  rss: z.object({ channel: z.object({ item: oneOrMore(searchItem) }) }),
});

type SearchItem = z.output<typeof searchItem>;

/** Text with the full-width letters and digits some libraries write as ordinary ones. */
const cleanText = (value: string) => cleanName(value.normalize('NFKC'));

const textOf = (values: SearchItem['dc:title']) => cleanText(values[0]?.text ?? '') || undefined;

const JAPANESE = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー・々ヶ]+$/u;

/**
 * A heading (`尾田, 栄一郎`, `林田, 球, 1977-`, `尾田/栄一郎`) as the name printed on the book. Japanese
 * names are written surname first, without a space.
 */
export function nameFromHeading(heading: string): string {
  const [surname = '', given = ''] = cleanText(heading)
    .split(/[,/]/u)
    .map((part) => part.trim())
    // Not the years of birth and death.
    .filter((part) => part && !/^\d/u.test(part));

  if (!given) {
    return surname;
  }

  return JAPANESE.test(surname) && JAPANESE.test(given) ? surname + given : `${given} ${surname}`;
}

/** The words after a name in the statement of responsibility, as roles; others are authors. */
const ROLES: [ContributorForm['role'], RegExp][] = [
  ['illustrator', /^(?:漫画|マンガ|まんが|作画|画|絵|イラスト)/u],
  ['translator', /^(?:翻訳|訳)/u],
  ['editor', /^(?:編|監修)/u],
];

function contributorsOf({ author, 'dc:creator': creators }: SearchItem): ContributorForm[] {
  const statement = author.map(({ text }) => cleanText(text)).join(' ');

  return creators
    .map(({ text }) => {
      const name = nameFromHeading(text);
      // `金城宗幸 原作`, `ノ村優介漫画`, `尾田栄一郎∥著`
      const words = name
        ? statement
            .split(name)
            .slice(1)
            .map((rest) => rest.replace(/^[\s∥]+/u, ''))
        : [];
      const role = ROLES.find(([, pattern]) => words.some((rest) => pattern.test(rest)))?.[0];

      return { name, role: role ?? ('author' as const) };
    })
    .filter(({ name }) => name)
    .slice(0, CONTRIBUTORS_MAX);
}

const KANJI_DIGITS = '〇一二三四五六七八九';

const kanjiDigit = (kanji: string | undefined) => (kanji ? KANJI_DIGITS.indexOf(kanji) : 0);

/** A number up to 99 written in kanji, such as `二十三`. */
function numberFromKanji(value: string): string | undefined {
  const match = /^(?:([一二三四五六七八九]?)(十))?([一二三四五六七八九]?)$/u.exec(value);

  if (!match?.[0]) {
    return undefined;
  }

  const [, tens, ten, units] = match;

  return String((ten ? (kanjiDigit(tens) || 1) * 10 : 0) + kanjiDigit(units));
}

/** The number of a volume written `9`, `第9巻`, `巻1` or `巻一`; other names (`上`) have none. */
export function positionFromVolume(volume: string | undefined): string | undefined {
  const number = volume?.replaceAll(/[第巻\s]/gu, '') ?? '';

  return /^\d{1,4}$/u.test(number) ? String(Number(number)) : numberFromKanji(number);
}

/** The pages of `224p` or `207p ; 18cm`; none of `1冊(ページ付なし)`, one unnumbered volume. */
const pagesFromExtent = (extent: string | undefined) => /(\d{1,5})\s*p/u.exec(extent ?? '')?.[1];

/** Comics in the Nippon Decimal Classification. */
const COMICS_CLASS = /^726\.1/u;

const isComic = (record: SearchItem) =>
  record['dcndl:genre'].some(({ text }) => text.includes('漫画'))
  || record['dc:subject'].some(
    ({ text, 'xsi:type': type }) => type?.startsWith('dcndl:NDC') && COMICS_CLASS.test(text),
  );

const isbnsOf = (record: SearchItem) =>
  record['dc:identifier']
    .filter(({ 'xsi:type': type }) => type?.startsWith('dcndl:ISBN'))
    .map(({ text }) => normalizeIsbn(text));

export async function fromNdl({ isbn13, isbn10 }: Isbns): Promise<BookDraft | null> {
  const url = new URL(NDL);

  url.searchParams.set('isbn', isbn13);
  url.searchParams.set('cnt', String(RECORDS_MAX));

  const response = searchResponse.safeParse(await getXml(url.toString(), TIMEOUT_MS));

  if (!response.success) {
    throw new SourceUnavailableError('ndlsearch.ndl.go.jp sent an unexpected answer', {
      cause: response.error,
    });
  }

  // Only this book's own records: one for a whole series lists the ISBN of every volume.
  const records = response.data.rss.channel.item.filter((record) =>
    isbnsOf(record).every((isbn) => isbn === isbn13 || isbn === isbn10),
  );
  // The National Diet Library's own record is the most detailed.
  const record =
    records.find((candidate) =>
      candidate['dc:identifier'].some(({ 'xsi:type': type }) => type === 'dcndl:NDLBibID'),
    ) ?? records[0];

  if (!record) {
    return null;
  }

  const title = textOf(record['dc:title']);
  const volume = textOf(record['dcndl:volume']);
  const position = positionFromVolume(volume);

  return compact({
    // Every volume is catalogued under the series' title: the number tells them apart.
    title: title && volume ? `${title} ${position ?? volume}` : title,
    contributors: contributorsOf(record),
    series: position ? title : undefined,
    seriesPosition: position,
    genres: isComic(record) ? ['comics'] : [],
    editionStatement: textOf(record['dcndl:edition']),
    publisher: textOf(record['dc:publisher']),
    published: publishedFromText(textOf(record['dcterms:issued'])),
    // Not in the answer, but what the ISBN's group says.
    language: 'ja',
    pageCount: pagesFromExtent(textOf(record['dc:extent'])),
  });
}
