import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { getBooksQueryInfinite } from '../queries/books/get'
import { cn } from '../utils/cn'

export function Books() {
  const {
    status,
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery(
    getBooksQueryInfinite({
      retry: false,
      refetchOnWindowFocus: false,
    }),
  )

  const parentRef = useRef<HTMLDivElement>(null)

  const allRows = data ? data.pages.flatMap((d) => d.items) : []

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  })

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    allRows.length,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    rowVirtualizer,
  ])

  if (status === 'pending') {
    return <p>Loading...</p>
  }

  if (status === 'error') {
    return <span>Error: {(error as Error).message}</span>
  }

  return (
    <>
      <div
        ref={parentRef}
        className="relative w-full overflow-auto border border-solid border-red-400"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index > allRows.length - 1
          const book = allRows[virtualRow.index]

          return (
            <div
              key={virtualRow.index}
              className={cn(
                'absolute left-0 top-0 flex w-full flex-row justify-center',
                {
                  'bg-red-200': virtualRow.index % 2,
                  'bg-blue-200': !(virtualRow.index % 2),
                },
              )}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                hasNextPage ? (
                  'Loading more...'
                ) : (
                  'Nothing more to load'
                )
              ) : (
                <Link key={book.uri} to={book.uri}>
                  {book.title}
                </Link>
              )}
            </div>
          )
        })}
      </div>
      <div>
        {isFetching && !isFetchingNextPage ? 'Background Updating...' : null}
      </div>
    </>
  )
}
