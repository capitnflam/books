import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fromNdl, nameFromHeading, positionFromVolume } from './isbn-ndl.server';
import { SourceUnavailableError } from './isbn-source.server';

/** An answer of NDL Search with these items' elements. */
const answer = (...items: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Search</title>${items
  .map((item) => `<item>${item}</item>`)
  .join('')}</channel></rss>`;

const fetchMock = vi.fn<(input: string) => Promise<Response>>();

const respond = (xml: string) => fetchMock.mockImplementation(async () => new Response(xml));

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

const isbns = { isbn13: '9784065220733', isbn10: '4065220734' };

const blueLock = `
  <title>ブルーロック</title>
  <author>金城, 宗幸,ノ村, 優介,金城宗幸 原作,ノ村優介 漫画</author>
  <dc:title>ブルーロック</dc:title>
  <dc:creator>金城, 宗幸</dc:creator>
  <dc:creator>ノ村, 優介</dc:creator>
  <dcndl:volume>13</dcndl:volume>
  <dcndl:seriesTitle>講談社コミックス</dcndl:seriesTitle>
  <dc:publisher>講談社</dc:publisher>
  <dcterms:issued>2021.3</dcterms:issued>
  <dc:extent>192p ; 18cm</dc:extent>
  <dc:identifier xsi:type="dcndl:ISBN">978-4-06-522073-3</dc:identifier>
  <dc:identifier xsi:type="dcndl:NDLBibID">031325865</dc:identifier>
  <dc:subject xsi:type="dcndl:NDC10">726.1</dc:subject>`;

describe('fromNdl', () => {
  it('numbers the volumes of a manga, catalogued under its title', async () => {
    respond(answer(blueLock));

    // The imprint (`講談社コミックス`) is not the series.
    await expect(fromNdl(isbns)).resolves.toEqual({
      title: 'ブルーロック 13',
      contributors: [
        { name: '金城宗幸', role: 'author' },
        { name: 'ノ村優介', role: 'illustrator' },
      ],
      series: 'ブルーロック',
      seriesPosition: '13',
      genres: ['comics'],
      publisher: '講談社',
      published: '2021',
      language: 'ja',
      pageCount: '192',
    });
  });

  it('prefers the library’s own record and skips the record of a whole series', async () => {
    respond(
      answer(
        `<dc:title>Whole series</dc:title>
         <dc:identifier xsi:type="dcndl:ISBN">9784065220733</dc:identifier>
         <dc:identifier xsi:type="dcndl:ISBN">9784065321836</dc:identifier>
         <dc:identifier xsi:type="dcndl:NDLBibID">1</dc:identifier>`,
        `<dc:title>ＡＢＣ</dc:title>
         <dc:identifier xsi:type="dcndl:ISBN">4-06-522073-4</dc:identifier>`,
        blueLock,
      ),
    );

    await expect(fromNdl(isbns)).resolves.toMatchObject({ title: 'ブルーロック 13' });
  });

  it('reads a record with little in it', async () => {
    respond(
      answer('<dc:title>Ｄｒ．ＳＴＯＮＥ</dc:title><dc:extent>1冊(ページ付なし)</dc:extent>'),
    );

    await expect(fromNdl(isbns)).resolves.toEqual({ title: 'Dr.STONE', language: 'ja' });
  });

  it('finds nothing in an empty answer', async () => {
    respond(answer());

    await expect(fromNdl(isbns)).resolves.toBeNull();
  });

  it('counts anything else as unavailable', async () => {
    respond('<html><body>Maintenance</body></html>');

    await expect(fromNdl(isbns)).rejects.toThrow(SourceUnavailableError);
  });
});

describe('nameFromHeading', () => {
  it('writes the name as printed', () => {
    expect(nameFromHeading('尾田, 栄一郎')).toBe('尾田栄一郎');
    expect(nameFromHeading('尾田/栄一郎')).toBe('尾田栄一郎');
    expect(nameFromHeading('林田, 球, 1977-')).toBe('林田球');
    expect(nameFromHeading('Boichi')).toBe('Boichi');
    expect(nameFromHeading('Moore, Alan, 1953-')).toBe('Alan Moore');
  });
});

describe('positionFromVolume', () => {
  it('reads the number of a volume', () => {
    expect(positionFromVolume('13')).toBe('13');
    expect(positionFromVolume('第09巻')).toBe('9');
    expect(positionFromVolume('巻1')).toBe('1');
    expect(positionFromVolume('巻一')).toBe('1');
    expect(positionFromVolume('十')).toBe('10');
    expect(positionFromVolume('二十三')).toBe('23');
    expect(positionFromVolume('上')).toBeUndefined();
    expect(positionFromVolume(undefined)).toBeUndefined();
  });
});
