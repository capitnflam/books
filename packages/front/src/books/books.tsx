import { Card, CardBody, Chip, Pagination, Spinner } from '@nextui-org/react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthorResult } from '~books/types'

import { getAuthorQuery } from '../queries/author/get'
import { getBooksQueryPaginated } from '../queries/books/get'
import { PageParam } from '../types/page-param'
// import { cn } from '../utils/cn'

export function Books() {
  const [pageParam, setPageParam] = useState<PageParam>({ page: 1, limit: 10 })
  const { data, error } = useQuery(
    getBooksQueryPaginated(pageParam, {
      retry: false,
      refetchOnWindowFocus: false,
    }),
  )
  const authorsList = useMemo(
    () =>
      data?.items
        .map((book) => book.authors)
        .reduce((acc, authors) => {
          authors.forEach((author) => {
            if (!acc.includes(author)) {
              acc.push(author)
            }
          })
          return acc
        }, []) ?? [],
    [data?.items],
  )

  const authors = useQueries({
    queries: authorsList.map((author) => getAuthorQuery(author)),
  }).reduce<Record<string, AuthorResult>>((acc, author) => {
    if (author.data) {
      acc[author.data.uri] = author.data
    }
    return acc
  }, {})

  if (data) {
    return (
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex flex-col gap-3">
          {data.items.map((book) => {
            return (
              <Link key={book.uri} to={book.uri}>
                <Card className="transition-opacity hover:opacity-80">
                  <CardBody className="flex flex-row justify-between">
                    <div className="flex flex-col gap-2">
                      {book.title}
                      <div className="flex flex-row gap-2">
                        {book.authors.map((author) => {
                          if (authors[author]) {
                            return (
                              <Chip key={author} size="sm">
                                {authors[author].name}
                              </Chip>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span>22/12/2023</span>
                      <span>{book.isbn}</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            )
          })}
        </div>
        <Pagination
          className="self-end"
          total={data.meta.totalPages ?? Infinity}
          page={pageParam.page}
          onChange={(page) => {
            setPageParam((previous) => ({ ...previous, page }))
          }}
          showControls
          showShadow
        />
      </div>
    )
  }

  if (error) {
    return <p>Error: {(error as Error).message}</p>
  }

  return (
    <div className="flex h-full w-full flex-row items-center justify-center">
      <Spinner />
    </div>
  )
}
