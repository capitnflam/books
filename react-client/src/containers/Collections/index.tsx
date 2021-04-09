import { List, Typography } from 'antd'
import React, { useCallback, useRef } from 'react'
import { useVirtual, VirtualItem } from 'react-virtual'

const renderRow = (item: VirtualItem) => {
  return (
    <List.Item key={item.index}>
      <Typography.Text>{`foo ${JSON.stringify(item)}`}</Typography.Text>
    </List.Item>
  )
}

export default function Collections(): JSX.Element {
  const parentRef = useRef()
  const rowVirtualizer = useVirtual({
    size: 1000,
    parentRef,
    estimateSize: useCallback(() => 42, []),
  })

  return (
    <div style={{ height: `${rowVirtualizer.totalSize}px` }}>
      {rowVirtualizer.virtualItems.map(renderRow)}
    </div>
  )
}
