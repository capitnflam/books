import { notFound } from '@tanstack/react-router';

import { bookIdSchema } from './catalog';
import { getBookFn } from './catalog.functions';

/** Loads a book's page; a book that doesn't exist, or something not a book id, is not found. */
export async function loadBookDetails(params: { bookId: string }) {
  const details = bookIdSchema.safeParse(params).success
    ? await getBookFn({ data: { bookId: params.bookId } })
    : null;

  if (!details) {
    throw notFound();
  }

  return details;
}

export type BookDetails = Awaited<ReturnType<typeof loadBookDetails>>;
export type EditionDetails = BookDetails['book']['editions'][number];
