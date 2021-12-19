import React from 'react'
import { IconButton, IconButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'

type Props = IconButtonProps & {
  isExpanded: boolean
}

export const ExpandMore = styled((props: Props) => {
  const { isExpanded, ...other } = props
  return <IconButton {...other} />
})(({ theme, isExpanded }) => ({
  transform: !isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))
