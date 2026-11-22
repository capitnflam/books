import { z } from 'zod';

import { genresFromSubjects } from './genres';
import {
  AUTHORS_MAX,
  cleanDescription,
  cleanName,
  cleanSubjects,
  compact,
  getJson,
  publishedFromText,
} from './isbn-source.server';

import type { BookDraft } from './catalog';
import type { Isbns } from './isbn';

const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes';

const googleBooksVolumes = z.object({
  items: z
    .array(
      z.object({
        volumeInfo: z.object({
          title: z.string().optional(),
          subtitle: z.string().optional(),
          authors: z.array(z.string()).optional(),
          publisher: z.string().optional(),
          publishedDate: z.string().optional(),
          description: z.string().optional(),
          // Google gives 0 when it does not know, which must not fail the whole answer
          pageCount: z.number().int().positive().optional().catch(undefined),
          categories: z.array(z.string()).optional(),
          language: z.string().optional(),
          imageLinks: z.object({ thumbnail: z.string().optional() }).optional(),
        }),
      }),
    )
    .optional(),
});

export async function fromGoogleBooks(
  { isbn13 }: Isbns,
  apiKey: string,
): Promise<BookDraft | null> {
  const url = new URL(GOOGLE_BOOKS);

  url.searchParams.set('q', `isbn:${isbn13}`);
  url.searchParams.set('key', apiKey);

  const volume = googleBooksVolumes.safeParse(await getJson(url.toString())).data?.items?.[0]
    ?.volumeInfo;

  if (!volume) {
    return null;
  }

  return compact({
    title: volume.title,
    subtitle: volume.subtitle,
    contributors: volume.authors
      ?.slice(0, AUTHORS_MAX)
      .map((name) => ({ name: cleanName(name), role: 'author' })),
    description: cleanDescription(volume.description),
    genres: genresFromSubjects(volume.categories ?? []),
    subjects: cleanSubjects(
      volume.categories?.flatMap((category) => category.split(' / ')) ?? [],
    ).join(', '),
    publisher: volume.publisher,
    published: publishedFromText(volume.publishedDate),
    language: /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u.test(volume.language ?? '')
      ? volume.language
      : undefined,
    pageCount: volume.pageCount?.toString(),
    coverImageUrl: volume.imageLinks?.thumbnail
      ?.replace(/^http:/u, 'https:')
      .replace('&edge=curl', ''),
  });
}
