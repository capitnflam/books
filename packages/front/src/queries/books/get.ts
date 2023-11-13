import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { BooksResult } from '~books/types'

import { getBooks } from '../../services/books/get'

export function getBooksQuery(
  options: Omit<
    Parameters<typeof useQuery<BooksResult>>[0],
    'queryKey' | 'queryFn'
  > = {},
) {
  return { ...options, queryKey: ['books'], queryFn: () => getBooks() }
}

export function getBooksQueryInfinite(
  options: Omit<
    Parameters<typeof useInfiniteQuery<BooksResult>>[0],
    'queryKey' | 'queryFn'
  >,
) {
  return { ...options, queryKey: ['books'], queryFn: () => getBooks() }
}
