import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { getBooksQueryInfinite } from '../queries/books/get'

// import { VirtualList } from '../components/virtual-list'

export function Books() {
  const { data: books, error } = useInfiniteQuery(
    getBooksQueryInfinite({
      retry: false,
      refetchOnWindowFocus: false,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => 1,
    }),
  )

  if (books) {
    return (
      <div className="flex flex-col">
        Books
        {books?.pages.map((page) =>
          page.map((book) => (
            <Link key={book.uri} to={book.uri}>
              {book.title}
            </Link>
          )),
        )}
        {/* <Link to="/book/1">book 1</Link>
      <Link to="/book/2">book 2</Link>
      <Link to="/book/3">book 3</Link>
      <Link to="/book/4">book 4</Link>
      <Link to="/book/5">book 5</Link> */}
      </div>
    )
  }

  if (error) {
    return <div>{(error as Error).message}</div>
  }

  return <div>loading</div>
}
