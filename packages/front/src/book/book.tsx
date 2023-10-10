import { ArrowPathIcon, LinkIcon } from '@heroicons/react/24/outline'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Image,
  Link,
  Spinner,
} from '@nextui-org/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useMemo } from 'react'
import { Link as RoutedLink, useParams } from 'react-router-dom'

import { Book as BookType } from '~books/types'

import { Markdown } from '../components/markdown'
import { RouteParams } from '../utils/route-params'

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
    return (
      <Card className="h-full w-full">
        <CardHeader className="justify-center">Loading</CardHeader>
        <Divider />
        <CardBody className="items-center justify-center">
          <Spinner size="lg" label="Loading..." color="default" />
        </CardBody>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="h-full w-full">
        <CardHeader className="justify-center">Error</CardHeader>
        <Divider />
        <CardBody className="items-center justify-center">
          {(error as Error).message}
        </CardBody>
      </Card>
    )
  }

  if (!isSuccess) {
    return (
      <Card className="h-full w-full">
        <CardHeader className="justify-center">Error</CardHeader>
        <Divider />
        <CardBody className="items-center justify-center">
          Unknown error
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="h-full w-full">
      <CardHeader>
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
          <div className="m-2 flex w-full flex-wrap justify-evenly">
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
        <div className="flex h-full flex-col justify-start">
          <ArrowPathIcon
            className={`h-6 w-6 ${
              isRefetching ? 'animate-spin' : ''
            } hover:cursor-pointer`}
            onClick={refreshOnDemand}
          />
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        {book?.synopsis && (
          <Markdown className="mx-auto max-w-[80%]">{book.synopsis}</Markdown>
        )}
      </CardBody>
    </Card>
  )
}
