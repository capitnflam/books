import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { Book as BookType } from '~books/types'

import { useEntitiesApiQuery } from '../hooks/use-entities-api-query'

// import { VirtualList } from '../components/virtual-list'

export function Books() {
  const {
    data: books,
    error,
    isError,
    isLoading,
    isRefetching,
    isSuccess,
    refetch,
  } = useEntitiesApiQuery<BookType[]>('books', {
    retry: false,
    refetchOnWindowFocus: false,
  })
  const refreshOnDemand = useCallback(async () => {
    await refetch()
  }, [refetch])

  if (isLoading) {
    return <div>loading</div>
  }

  if (isError) {
    return <div>{(error as Error).message}</div>
  }

  if (!isSuccess) {
    return <div>Unknown error</div>
  }

  return (
    <div className="flex flex-col">
      Books
      {books?.map((book) => (
        <Link key={book.uri} to={book.uri}>
          {book.title}
        </Link>
      ))}
      {/* <Link to="/book/1">book 1</Link>
      <Link to="/book/2">book 2</Link>
      <Link to="/book/3">book 3</Link>
      <Link to="/book/4">book 4</Link>
      <Link to="/book/5">book 5</Link> */}
    </div>
  )
}
