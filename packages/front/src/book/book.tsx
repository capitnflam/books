import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import RehypeSanitize from 'rehype-sanitize'
import RemarkEmoji from 'remark-emoji'

import { Spinner } from '../components/spinner'
import { RouteParams } from '../utils/route-params'

import { Book as BookType } from '~books/types'

type ParamsKey = 'id'

function linkTargetTransform(href: string) {
  if (!href.startsWith('/')) {
    return '_blank'
  }
}

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

  if (isLoading) {
    return (
      <Spinner className="flex h-full w-full items-center justify-center" />
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
    <div className="flex h-full w-full flex-col">
      <div className="flex w-full flex-row">
        <div className="flex h-[600px] w-[400px] items-center justify-center">
          <img className="h-auto w-auto" src={book.coverURL} alt={book.title} />
        </div>
        <div className="w-full">
          <Link className="text-xl font-bold" to={book.uri}>
            {book.title}
          </Link>
          <div className="flex w-full flex-wrap">
            {book.authors.map((author, index) => (
              <Link
                key={`${author.name}_${index}`}
                className="m-1 rounded-full bg-blue-400 px-2"
                to={author.uri}
              >
                {author.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div>
        <ReactMarkdown
          rehypePlugins={[RehypeSanitize]}
          remarkPlugins={[RemarkEmoji]}
          linkTarget={linkTargetTransform}
        >
          {book.synopsis}
        </ReactMarkdown>
      </div>
    </div>
  )
}
