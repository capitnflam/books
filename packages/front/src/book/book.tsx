import {
  Card,
  CardBody,
  CardHeader,
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
      <div className="flex h-full items-center justify-center gap-4">
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
    <Card className="m-2 w-full">
      <CardHeader>
        <div className="flex max-h-[600px] min-h-[150px] min-w-[100px] max-w-[400px] items-center justify-center">
          {cover}
        </div>
        <div className="flex flex-col">
          <Link className="text-xl font-bold" as={RoutedLink} to={book?.uri}>
            {book?.title}
          </Link>
          <div className="flex w-full flex-wrap justify-evenly">
            {book?.authors.map((author, index) => (
              <Link
                key={`${author.name}_${index}`}
                className="m-1 rounded-full bg-blue-400 px-2"
                as={RoutedLink}
                to={author.uri}
              >
                {author.name}
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
