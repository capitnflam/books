import { ArrowPathIcon, LinkIcon } from '@heroicons/react/24/outline'
import { Chip, Image, Link } from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useMemo } from 'react'
import { Link as RoutedLink, useParams } from 'react-router-dom'

import { Book as BookType } from '~books/types'

import { Markdown } from '../components/markdown'
import { RouteParams } from '../utils/route-params'

import { BookCard } from './book-card'
import { BookLoading } from './book-loading'

type ParamsKey = 'id'

export function Book() {
  const { id } = useParams<RouteParams<ParamsKey>>()
  const {
    data: book,
    error,
    isError,
    isLoading,
    isRefetching,
    isSuccess,
    refetch,
  } = useQuery<BookType>({
    queryKey: ['book', id],
    queryFn: async ({ queryKey }) => {
      const [type, id] = queryKey
      const uri = `/${type}/${id}`

      return axios.get(uri, { baseURL: '/api' }).then((res) => res.data)
    },
    retry: false,
    refetchOnWindowFocus: false,
  })
  const refreshOnDemand = useCallback(async () => {
    await refetch()
  }, [refetch])

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

  if (isLoading) {
    return <BookLoading id={id ?? '0'} />
  }

  if (isError) {
    return <BookCard header="Error">{(error as Error).message}</BookCard>
  }

  if (!isSuccess) {
    return <BookCard header="Error">Unknown error</BookCard>
  }

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
              {book?.authors.map((author, index) => (
                <Link
                  key={`${author.name}_${index}`}
                  as={RoutedLink}
                  to={author.uri}
                >
                  <Chip variant="solid">{author.name}</Chip>
                </Link>
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 mr-4 mt-4">
            <ArrowPathIcon
              className={`h-6 w-6 ${
                isRefetching ? 'animate-spin' : ''
              } hover:animate-spin hover:cursor-pointer`}
              onClick={refreshOnDemand}
            />
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
