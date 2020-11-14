import { ListItem } from '@material-ui/core'
import React from 'react'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

const renderRow = ({ index, style }: ListChildComponentProps) => {
  return (
    <ListItem key={index} style={style}>
      foo
    </ListItem>
  )
}

export default function Collections(): JSX.Element {
  return (
    <FixedSizeList height={42} itemCount={42} itemSize={42} width={42}>
      {renderRow}
    </FixedSizeList>
  )
}
