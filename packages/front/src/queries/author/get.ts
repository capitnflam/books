import { useQuery } from '@tanstack/react-query'

import { AuthorResult } from '~books/types'

import { getAuthor } from '../../services/author/get'

export function getAuthorQuery(
  uri: string,
  options: Omit<
    Parameters<typeof useQuery<AuthorResult>>[0],
    'queryKey' | 'queryFn'
  > = {},
) {
  return {
    ...options,
    queryKey: ['author', uri],
    queryFn: () => getAuthor(uri),
  }
}
