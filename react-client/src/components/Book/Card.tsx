import { Card as AntCard } from 'antd'

import React from 'react'

import unavailable from './unavailable-cover.png'

interface Props {
  cover?: string | null
}

export default function Card({ cover }: Props): JSX.Element {
  return (
    <AntCard title="foobar">
      <img src={cover || unavailable} style={{ height: 140 }} />
    </AntCard>
  )
}
