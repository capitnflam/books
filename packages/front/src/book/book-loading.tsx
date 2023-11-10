import { Chip, Skeleton } from '@nextui-org/react'
import { useMemo } from 'react'

import { cn } from '../utils/cn'

import { BookCard } from './book-card'

function getRandomInt(min: number, max: number) {
  const minValue = Math.ceil(min)
  const maxValue = Math.floor(max)
  return Math.floor(Math.random() * (maxValue - minValue) + minValue)
}

const widthClassNames = [
  'w-0',
  'w-1/12',
  'w-2/12',
  'w-3/12',
  'w-4/12',
  'w-5/12',
  'w-6/12',
  'w-7/12',
  'w-8/12',
  'w-9/12',
  'w-10/12',
  'w-11/12',
  'w-full',
]

export function BookLoading({ id }: { readonly id: string }) {
  const randomContent = useMemo(() => {
    const nbLines = getRandomInt(3, 9)
    const lines = Array.from({ length: nbLines }).map((_, index) => {
      const length = getRandomInt(3, 9)
      return (
        <Skeleton
          key={`random_${id}_${index}`}
          className={cn('h-6 rounded-lg', widthClassNames[length])}
        />
      )
    })

    return lines
  }, [id])

  const randomAuthors = useMemo(() => {
    const nbAuthors = getRandomInt(1, 3)
    const authors = Array.from({ length: nbAuthors }).map((_, index) => {
      return (
        <Chip key={`author_${id}_${index}`} variant="solid">
          <Skeleton className="h-4 w-24 rounded-lg" />
        </Chip>
      )
    })

    return authors
  }, [id])

  return (
    <BookCard
      header={
        <>
          <div className="flex max-h-[600px] min-h-[150px] min-w-[100px] max-w-[400px] items-center justify-center">
            <Skeleton className="h-[150px] w-[100px] rounded-xl" />
          </div>
          <div className="flex w-full flex-col items-center">
            <Skeleton className="h-8 w-1/2 rounded-lg text-3xl font-bold" />
            <div className="m-2 flex w-full flex-wrap justify-center gap-2">
              {randomAuthors}
            </div>
          </div>
          <div className="absolute right-0 top-0 mr-4 mt-4">
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </>
      }
    >
      <div className="space-y-2">{randomContent}</div>
    </BookCard>
  )
}
