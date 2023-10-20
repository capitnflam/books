import { VirtualItem, useVirtualizer } from '@tanstack/react-virtual'
import { ReactNode, useRef } from 'react'

interface Props<Item> {
  readonly className: string
  readonly estimateSize: (index: number) => number
  readonly overscan: number
  readonly rows: Item[]
  // style={{
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   width: '100%',
  //   height: `${rows[virtualRow.index]}px`,
  //   transform: `translateY(${virtualRow.start}px)`,
  // }}
  readonly rowRenderer: (item: VirtualItem & { data: Item }) => ReactNode
}

export function VirtualList<Item>({
  className,
  estimateSize,
  overscan = 5,
  rows,
  rowRenderer,
}: Props<Item>) {
  const parentRef = useRef<Element>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize,
    getScrollElement: () => parentRef.current,
    overscan,
  })

  return (
    <div className={`${className} overflow-auto`}>
      <div className={`relative h-[${virtualizer.getTotalSize()}px] w-full`}>
        {virtualizer
          .getVirtualItems()
          .map((item) => rowRenderer({ ...item, data: rows[item.index] }))}
      </div>
    </div>
  )
}
