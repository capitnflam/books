import React from 'react'
import { Card, CardHeader, CardContent, CardMedia } from '@mui/material'

interface Props {
  author?: string
  cover?: string
  isbn?: string
  synopsis?: string
  title?: string
}

export const Book = ({ author, cover, isbn, synopsis, title }: Props) => {
  return (
    <Card>
      <CardHeader></CardHeader>
      <CardMedia></CardMedia>
      <CardContent></CardContent>
    </Card>
  )
}
