import { LinkIcon } from '@heroicons/react/24/outline'
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
import { useMemo } from 'react'
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
    isSuccess,
  } = useQuery<BookType>({
    queryKey: ['book', id],
    queryFn: async ({ queryKey }) => {
      const [type, id] = queryKey
      const uri = `/${type}/${id}`

      return axios.get(uri, { baseURL: '/api' }).then((res) => res.data)
    },
    retry: false,
  })

  const cover = useMemo(() => {
    if (book) {
      if (book?.coverURL) {
        return <Image alt={book.title} src={book.coverURL} />
      }
      return (
        <span className="h-auto w-auto whitespace-nowrap bg-slate-300">
          No cover
        </span>
      )
    }
  }, [book])

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-row items-center justify-center">
        <Spinner size="lg" label="Loading..." color="default" />
      </div>
    )
  }

  if (isError) {
    // TODO
    return <span>{JSON.stringify(error)}</span>
  }

  if (!isSuccess) {
    // TODO
    return <span>Unknown error</span>
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
