import { z } from 'zod';

import { CONTRIBUTORS_MAX } from './catalog';
import { normalizeIsbn } from './isbn';
import {
  cleanName,
  cleanSubjects,
  compact,
  getXml,
  languageFromMarc,
  oneOrMore,
  publishedFromText,
  SourceUnavailableError,
} from './isbn-source.server';

import type { BookDraft, ContributorForm } from './catalog';
import type { Isbns } from './isbn';
import type { EditionFormat } from '@books/database';

// The general catalogue of the Bibliothèque nationale de France, as UNIMARC records. Open data
// (Licence Ouverte), but summaries credit a commercial database (Electre): they are not read.
// https://api.bnf.fr/fr/api-sru-catalogue-general
const BNF = 'https://catalogue.bnf.fr/api/SRU';
// An old ISBN may have been given to several printings.
const RECORDS_MAX = 5;

const subfield = z.object({ code: z.string(), text: z.string() });
const datafield = z.object({ tag: z.string(), 'mxc:subfield': oneOrMore(subfield) });

const searchResponse = z.object({
  'srw:searchRetrieveResponse': z.object({
    'srw:numberOfRecords': z.object({ text: z.string() }),
    'srw:records': z
      .object({
        'srw:record': oneOrMore(
          z.object({
            'srw:recordData': z.object({
              'mxc:record': z.object({ 'mxc:datafield': oneOrMore(datafield) }),
            }),
          }),
        ),
      })
      .optional(),
  }),
});

type Datafield = z.output<typeof datafield>;

/** Text without the control characters around the words not to sort by (a title's article). */
const cleanText = (value: string) => cleanName(value.normalize('NFC').replaceAll(/\p{Cc}/gu, ''));

/** The non-empty values of a field's subfields with this code. */
const valuesOf = (field: Datafield | undefined, code: string): string[] =>
  (field?.['mxc:subfield'] ?? [])
    .filter((item) => item.code === code)
    .map((item) => cleanText(item.text))
    .filter(Boolean);

const firstOf = (field: Datafield | undefined, code: string) => valuesOf(field, code)[0];

/** `[Éd. collector]` as `Éd. collector`: the brackets mean it is not printed on the book. */
const withoutBrackets = (value: string | undefined) => value?.replaceAll(/[[\]]/gu, '').trim();

/** `le Lombard` as `Le Lombard`: a publisher's article is catalogued in lower case. */
const capitalize = (value: string | undefined) =>
  value?.replace(/^\p{Ll}/u, (letter) => letter.toUpperCase());

/** UNIMARC relator codes the form has a role for. */
const ROLES: Record<string, ContributorForm['role']> = {
  '040': 'illustrator',
  '070': 'author',
  '075': 'introduction',
  '080': 'introduction',
  '340': 'editor',
  '440': 'illustrator',
  '550': 'narrator',
  '690': 'author',
  '730': 'translator',
};

/** People credited (700: main, 701: joint, 702: others), in the record's order. */
function contributorsOf(fields: readonly Datafield[]): ContributorForm[] {
  const seen = new Set<string>();

  return fields
    .filter(({ tag }) => ['700', '701', '702'].includes(tag))
    .flatMap((field) => {
      const name = [firstOf(field, 'b'), firstOf(field, 'a')].filter(Boolean).join(' ');
      const codes = valuesOf(field, '4');
      // The main credit of a record without codes is its author.
      const roles =
        codes.length === 0 && field.tag !== '702'
          ? (['author'] as const)
          : codes.flatMap((code) => ROLES[code] ?? []);

      return name ? roles.map((role) => ({ name, role })) : [];
    })
    .filter(({ name, role }) => {
      const key = `${role} ${name}`;
      const isNew = !seen.has(key);

      seen.add(key);

      return isNew;
    })
    .slice(0, CONTRIBUTORS_MAX);
}

/** The number in `4`, `tome 1` or `Vol. 4`; none in `1-3` or `Première partie`. */
const positionFromText = (value: string | undefined) =>
  /^\D*(\d{1,4}(?:[.,]\d{1,2})?)\D*$/u.exec(value ?? '')?.[1];

/** `9` as `tome 9`; a part already named (`Première partie`) as it is. */
const volumeName = (volume: string) =>
  /^(?:\d+|[IVXLC]+)$/u.test(volume) ? `tome ${volume}` : volume;

/**
 * The title and series. Volumes of a manga are catalogued under the series' title with a number
 * (`Mob psycho 100`, 9), which the title keeps so that they can be told apart; those of a comic
 * under their own title, or as a named part of the series (`Blacksad`, 3, `Âme rouge`).
 */
function titlesOf(title: Datafield | undefined, parent: Datafield | undefined): BookDraft {
  const name = firstOf(title, 'a');
  const volume = firstOf(title, 'h');
  const part = firstOf(title, 'i');
  const position = positionFromText(volume);
  // A single full stop is the catalogue's punctuation; more are part of the name.
  const parentName = firstOf(parent, 't')?.replace(/(?<!\.)\.$/u, '');
  const series = parentName ?? (position ? name : undefined);
  const isSeriesTitle = name !== undefined && name.toLowerCase() === series?.toLowerCase();
  const subtitle = firstOf(title, 'e');

  const titles =
    part && isSeriesTitle
      ? { title: part, subtitle }
      : {
          title: name && volume ? `${name}, ${volumeName(volume)}` : name,
          subtitle: part ?? subtitle,
        };

  return {
    ...titles,
    series,
    seriesPosition:
      positionFromText(firstOf(parent, 'v')) ?? (isSeriesTitle ? position : undefined),
  };
}

/** The pages of `1 vol. (187 p.)`; none of `(953-96 p.)`, numbered in parts. */
export function pagesFromDescription(value: string | undefined): string | undefined {
  const pages = /(?<!\d|\d-)(\d{1,5})\]?\s*p\b/u.exec(value ?? '')?.[1];

  return Number(pages) > 0 ? pages : undefined;
}

/** The binding written with an ISBN: `br.` (broché), `rel.` (relié), `Cart.` (cartonné). */
function formatFromBinding(value: string | undefined): EditionFormat | undefined {
  const binding = value?.toLowerCase() ?? '';

  if (binding.startsWith('br')) {
    return 'paperback';
  }

  return /^(?:rel|rl|cart)/u.test(binding) ? 'hardcover' : undefined;
}

/** Comics' class in the national bibliography; older records only have the form heading. */
const COMICS_CLASS = '805';

export async function fromBnf({ isbn13, isbn10 }: Isbns): Promise<BookDraft | null> {
  const url = new URL(BNF);

  url.searchParams.set('version', '1.2');
  url.searchParams.set('operation', 'searchRetrieve');
  url.searchParams.set('recordSchema', 'unimarcxchange');
  url.searchParams.set('maximumRecords', String(RECORDS_MAX));
  // `fuzzyIsbn` also finds records that only have the ISBN-10, as `isbn` does not.
  url.searchParams.set('query', `bib.fuzzyIsbn adj "${isbn13}"`);

  const response = searchResponse.safeParse(await getXml(url.toString()));

  // A refused query is answered with a diagnostic and no count.
  if (!response.success) {
    throw new SourceUnavailableError('catalogue.bnf.fr sent an unexpected answer', {
      cause: response.error,
    });
  }

  const records = (
    response.data['srw:searchRetrieveResponse']['srw:records']?.['srw:record'] ?? []
  ).map((record) => record['srw:recordData']['mxc:record']['mxc:datafield']);
  const isbnField = (fields: readonly Datafield[]) =>
    fields.find((field) => {
      const isbn = field.tag === '010' ? firstOf(field, 'a') : undefined;

      return isbn !== undefined && [isbn13, isbn10].includes(normalizeIsbn(isbn));
    });
  const fields = records.find((record) => isbnField(record)) ?? records[0];

  if (!fields) {
    return null;
  }

  const first = (tag: string) => fields.find((field) => field.tag === tag);
  const all = (tag: string, code: string) =>
    fields.filter((field) => field.tag === tag).flatMap((field) => valuesOf(field, code));
  const publication = fields.find(
    (field) => ['210', '214'].includes(field.tag) && firstOf(field, 'c'),
  );
  const isComic =
    all('686', 'a').includes(COMICS_CLASS)
    || all('608', 'a').some((form) => /bandes? dessinée|manga/iu.test(form));

  return compact({
    ...titlesOf(first('200'), first('461')),
    contributors: contributorsOf(fields),
    originalLanguage: languageFromMarc(firstOf(first('101'), 'c')),
    genres: isComic ? ['comics'] : [],
    subjects: cleanSubjects(all('606', 'a')).join(', '),
    editionStatement: withoutBrackets(firstOf(first('205'), 'a')),
    publisher: capitalize(withoutBrackets(firstOf(publication, 'c'))),
    published: publishedFromText(firstOf(publication, 'd')),
    language: languageFromMarc(firstOf(first('101'), 'a')),
    format: formatFromBinding(firstOf(isbnField(fields), 'b')),
    pageCount: pagesFromDescription(firstOf(first('215'), 'a')),
  });
}
