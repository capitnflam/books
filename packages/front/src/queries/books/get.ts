import {
  InfiniteData,
  QueryFunctionContext,
  QueryKey,
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'

import { BooksResult } from '~books/types'

import { getBooks } from '../../services/books/get'
import { PageParam } from '../../types/page-param'

type UseInfiniteQueryParameters = Parameters<
  typeof useInfiniteQuery<
    BooksResult,
    Error,
    InfiniteData<BooksResult, PageParam>,
    QueryKey,
    PageParam
  >
>

export function getBooksQueryPaginated(
  pageParam: PageParam,
  options: Omit<
    Parameters<typeof useQuery<BooksResult>>[0],
    'queryKey' | 'queryFn'
  > = {},
) {
  return {
    placeHolderData: keepPreviousData<BooksResult>,
    ...options,
    queryKey: ['books', pageParam],
    queryFn: () => getBooks(pageParam),
  }
}

export function getBooksQueryInfinite(
  options: Omit<
    UseInfiniteQueryParameters[0],
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  > &
    Partial<
      Pick<
        UseInfiniteQueryParameters[0],
        'getNextPageParam' | 'initialPageParam'
      >
    >,
) {
  return {
    initialPageParam: { page: 1, limit: 10 },
    getNextPageParam: (lastPage: BooksResult) => {
      if (
        (lastPage.meta.totalPages == null
          ? Infinity
          : lastPage.meta.totalPages) > lastPage.meta.currentPage &&
        lastPage.meta.itemCount > 0
      ) {
        return {
          page: lastPage.meta.currentPage + 1,
          limit: lastPage.meta.itemsPerPage,
        }
      }
      return undefined
    },
    ...options,
    queryKey: ['books'],
    queryFn: (context: QueryFunctionContext<QueryKey, PageParam>) =>
      getBooks(context.pageParam),
  }
}
