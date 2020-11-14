import {
  Card as MaterialCard,
  CardContent,
  CardMedia,
  CardHeader,
} from '@material-ui/core'
import React from 'react'

import unavailable from './unavailable-cover.png'

interface Props {
  cover?: string | null
}

export default function Card({ cover }: Props): JSX.Element {
  return (
    <MaterialCard>
      <CardHeader title="foobar">barfoo</CardHeader>
      <CardMedia
        style={{ height: 140 }}
        image={cover || unavailable}
      ></CardMedia>
      <CardContent>woot</CardContent>
    </MaterialCard>
  )
}
