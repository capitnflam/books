import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fromBnf, pagesFromDescription } from './isbn-bnf.server';
import { SourceUnavailableError } from './isbn-source.server';

type Field = [tag: string, ...subfields: [code: string, value: string][]];

const recordXml = (fields: Field[]) =>
  `<srw:record><srw:recordData><mxc:record>${fields
    .map(
      ([tag, ...subfields]) =>
        `<mxc:datafield tag="${tag}" ind1=" " ind2=" ">${subfields
          .map(([code, value]) => `<mxc:subfield code="${code}">${value}</mxc:subfield>`)
          .join('')}</mxc:datafield>`,
    )
    .join('')}</mxc:record></srw:recordData></srw:record>`;

/** An answer of the catalogue with these records. */
const answer = (...records: Field[][]) => `<?xml version="1.0" encoding="UTF-8"?>
<srw:searchRetrieveResponse xmlns:srw="http://www.loc.gov/zing/srw/">
<srw:numberOfRecords>${records.length}</srw:numberOfRecords>
<srw:records>${records.map(recordXml).join('')}</srw:records>
</srw:searchRetrieveResponse>`;

const fetchMock = vi.fn<(input: string) => Promise<Response>>();

const respond = (xml: string) => fetchMock.mockImplementation(async () => new Response(xml));

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

const isbns = { isbn13: '9782811669140', isbn10: '2811669146' };

describe('fromBnf', () => {
  it('numbers the volumes of a manga, catalogued under its title', async () => {
    respond(
      answer([
        ['010', ['a', '978-2-8116-6914-0'], ['b', 'br.'], ['d', '7,20 EUR']],
        ['101', ['a', 'fre'], ['c', 'jpn']],
        ['200', ['a', 'Blue lock'], ['h', '9'], ['f', 'scénario, Muneyuki Kaneshiro']],
        ['205', ['a', '[Éd. collector]']],
        ['214', ['a', '[Vanves]'], ['c', 'Pika édition'], ['d', 'DL 2022']],
        ['214', ['a', 'impr. en Italie']],
        ['215', ['a', '1 vol. (non paginé [ca 184] p.)'], ['d', '18 cm']],
        ['225', ['a', 'Pika shônen']],
        ['330', ['a', 'Un résumé.'], ['2', 'Electre']],
        ['461', ['t', 'Blue lock'], ['v', '9']],
        ['686', ['a', '805']],
        ['700', ['a', 'Kaneshiro'], ['b', 'Muneyuki'], ['4', '070']],
        ['702', ['a', 'Nomura'], ['b', 'Yūsuke'], ['4', '440']],
        ['702', ['a', 'Someone'], ['b', 'Else'], ['4', '205']],
      ]),
    );

    // Neither the publisher's collection nor the summary (not open data) is kept.
    await expect(fromBnf(isbns)).resolves.toEqual({
      title: 'Blue lock, tome 9',
      series: 'Blue lock',
      seriesPosition: '9',
      contributors: [
        { name: 'Muneyuki Kaneshiro', role: 'author' },
        { name: 'Yūsuke Nomura', role: 'illustrator' },
      ],
      originalLanguage: 'ja',
      genres: ['comics'],
      editionStatement: 'Éd. collector',
      publisher: 'Pika édition',
      published: '2022',
      language: 'fr',
      format: 'paperback',
      pageCount: '184',
    });

    const url = new URL(fetchMock.mock.calls[0]![0]);

    expect(url.searchParams.get('query')).toBe('bib.fuzzyIsbn adj "9782811669140"');
  });

  it('keeps a comic’s own title', async () => {
    respond(
      answer([
        ['010', ['a', '2-87764-795-1'], ['b', 'rel.']],
        ['200', ['a', 'Cixi impératrice']],
        ['210', ['c', 'le Lombard'], ['d', '1998']],
        ['215', ['a', '47 p.']],
        ['461', ['t', 'Lanfeust de Troy.'], ['v', '6']],
        ['608', ['a', 'Bandes dessinées']],
        ['700', ['a', 'Yann'], ['4', '070']],
      ]),
    );

    await expect(fromBnf({ isbn13: '9782877647953', isbn10: '2877647951' })).resolves.toEqual({
      title: 'Cixi impératrice',
      series: 'Lanfeust de Troy',
      seriesPosition: '6',
      contributors: [{ name: 'Yann', role: 'author' }],
      genres: ['comics'],
      publisher: 'Le Lombard',
      published: '1998',
      format: 'hardcover',
      pageCount: '47',
    });
  });

  it('takes the name of a part of the series as its title', async () => {
    respond(
      answer([
        ['200', ['a', 'Blacksad'], ['h', '3'], ['i', 'Ame rouge']],
        ['461', ['t', 'Blacksad'], ['v', '3']],
      ]),
    );

    await expect(fromBnf(isbns)).resolves.toEqual({
      title: 'Ame rouge',
      series: 'Blacksad',
      seriesPosition: '3',
    });
  });

  it('drops the marks around an article and decodes character references', async () => {
    respond(
      answer([
        ['200', ['a', '&#136;L&#39;&#137;&#201;tranger &amp; co']],
        ['461', ['t', '&#136;Une &#137;aventure']],
      ]),
    );

    await expect(fromBnf(isbns)).resolves.toEqual({
      title: "L'Étranger & co",
      series: 'Une aventure',
    });
  });

  it('picks the record of the ISBN asked for', async () => {
    respond(
      answer(
        [
          ['010', ['a', '978-2-0000-0000-0']],
          ['200', ['a', 'Another book']],
        ],
        [
          ['010', ['a', '978-2-8116-6914-0']],
          ['200', ['a', 'This book']],
        ],
      ),
    );

    await expect(fromBnf(isbns)).resolves.toEqual({ title: 'This book' });
  });

  it('finds nothing in an empty answer', async () => {
    respond(
      '<srw:searchRetrieveResponse><srw:numberOfRecords>0</srw:numberOfRecords><srw:records/></srw:searchRetrieveResponse>',
    );

    await expect(fromBnf(isbns)).resolves.toBeNull();
  });

  it('counts anything else as unavailable', async () => {
    respond('<html><body>Maintenance</body></html>');

    await expect(fromBnf(isbns)).rejects.toThrow(SourceUnavailableError);
  });
});

describe('pagesFromDescription', () => {
  it('reads the pages of a physical description', () => {
    expect(pagesFromDescription('1 vol. (187 p.)')).toBe('187');
    expect(pagesFromDescription('1 volume 48 p')).toBe('48');
    expect(pagesFromDescription('1 vol. (non paginé [192] p.)')).toBe('192');
    expect(pagesFromDescription('1 vol. (XII-345 p.-8 p. de pl.)')).toBe('345');
    // Numbered in parts: neither number is the whole.
    expect(pagesFromDescription('1 vol. (953-96 p.')).toBeUndefined();
    expect(pagesFromDescription('1 vol. (non paginé)')).toBeUndefined();
    expect(pagesFromDescription(undefined)).toBeUndefined();
  });
});
