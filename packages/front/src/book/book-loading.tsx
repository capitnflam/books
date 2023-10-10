import { Chip, Skeleton } from '@nextui-org/react'
import { useMemo } from 'react'

import { BookCard } from './book-card'

function getRandomInt(min: number, max: number) {
  const minValue = Math.ceil(min)
  const maxValue = Math.floor(max)
  return Math.floor(Math.random() * (maxValue - minValue) + minValue)
}

export function BookLoading({ id }: { id: string }) {
  const randomContent = useMemo(() => {
    const nbLines = getRandomInt(3, 9)
    const lines = Array.from({ length: nbLines }).map((_, index) => {
      const length = getRandomInt(3, 9)
      return (
        <Skeleton
          key={`random_${id}_${index}`}
          className={`h-6 w-${length}/12 rounded-lg`}
        />
      )
    })

    return lines
  }, [id])

  return (
    <BookCard
      header={
        <>
          <div className="flex max-h-[600px] min-h-[150px] min-w-[100px] max-w-[400px] items-center justify-center">
            <Skeleton className="h-[150px] w-[100px]" />
          </div>
          <div className="flex w-full flex-col items-center">
            <Skeleton className="h-8 w-1/2 rounded-lg text-3xl font-bold" />
            <div className="m-2 flex w-full flex-wrap justify-evenly">
              <Chip variant="solid">
                <Skeleton className="h-4 w-24 rounded-lg" />
              </Chip>
              <Chip variant="solid">
                <Skeleton className="h-4 w-36 rounded-lg" />
              </Chip>
            </div>
          </div>
          <div className="flex h-full flex-col justify-start">
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </>
      }
    >
      <div className="space-y-2">{randomContent}</div>
    </BookCard>
  )
}
