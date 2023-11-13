import {
  ArrowPathIcon,
  LinkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import { Chip, Image, Link, Skeleton, Tooltip } from '@nextui-org/react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { Link as RoutedLink, useParams } from 'react-router-dom'

import { Markdown } from '../components/markdown'
import { getAuthorQuery } from '../queries/author/get'
import { getBookQuery } from '../queries/book/get'

import { BookCard } from './book-card'
import { BookEdit } from './book-edit'
import { BookLoading } from './book-loading'

type ParamsKey = 'id'

export function Book() {
  const { id } = useParams<ParamsKey>()
  const getQuery = getBookQuery(`/book/${id}`, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: id !== undefined,
  })
  const { data: book, error, isRefetching, refetch } = useQuery(getQuery)
  const refreshOnDemand = useCallback(async () => {
    await refetch()
  }, [refetch])

  const authors = useQueries({
    queries: book?.authors.map((author) => getAuthorQuery(author)) ?? [],
  })

  const cover = useMemo(() => {
    if (book) {
      if (book?.coverURL) {
        return <Image alt={book.title} src={book.coverURL} />
      }
      return (
        <span className="h-auto w-auto whitespace-nowrap bg-yellow-100 text-black">
          No cover
        </span>
      )
    }
  }, [book])

  if (id === undefined) {
    return <BookCard header="Error">No book id</BookCard>
  }

  if (book) {
    return (
      <BookCard
        header={
          <>
            <div className="flex max-h-[600px] min-h-[150px] min-w-[100px] max-w-[400px] items-center justify-center">
              {cover}
            </div>
            <div className="flex w-full flex-col items-center">
              <Link
                className="text-3xl font-bold"
                as={RoutedLink}
                to={book?.uri}
                anchorIcon={<LinkIcon className="h-4" />}
                showAnchorIcon
              >
                {book?.title}
              </Link>
              <div className="m-2 flex w-full flex-wrap justify-center gap-2">
                {authors.map((author, index) =>
                  author.data ? (
                    <Link
                      key={`${author.data?.uri}_${index}`}
                      as={RoutedLink}
                      to={author.data?.uri}
                    >
                      <Chip variant="solid">{author.data?.name}</Chip>
                    </Link>
                  ) : (
                    <Chip variant="solid" key={index}>
                      <Skeleton className="h-4 w-24 rounded-lg" />
                    </Chip>
                  ),
                )}
              </div>
            </div>
            <div className="absolute right-0 top-0 mr-4 mt-4 flex flex-row gap-2">
              <BookEdit id={id}>
                {/* FIXME: disable tooltip due to bug: https://github.com/nextui-org/nextui/issues/1759 */}
                {/* <Tooltip content="Edit"> */}
                <PencilIcon className="h-6 w-6 hover:cursor-pointer" />
                {/* </Tooltip> */}
              </BookEdit>

              <Tooltip content="Refresh">
                <ArrowPathIcon
                  className={`h-6 w-6 ${
                    isRefetching ? 'animate-spin' : ''
                  } hover:animate-spin hover:cursor-pointer`}
                  onClick={refreshOnDemand}
                />
              </Tooltip>
            </div>
          </>
        }
      >
        {book?.synopsis && (
          <Markdown className="mx-auto max-w-[80%]">{book.synopsis}</Markdown>
        )}
      </BookCard>
    )
  }

  if (error) {
    return <BookCard header="Error">{(error as Error).message}</BookCard>
  }

  return <BookLoading id={id ?? '0'} />
}
