import { Button, Row, Typography } from 'antd'
import React from 'react'

import { MenuIcon } from '../icons'

interface Props {
  currentIcon: any
  currentPage: string
  toggleMenuVisibility: () => void
}

export default function MainHeader({
  currentIcon: CurrentIcon,
  currentPage,
  toggleMenuVisibility,
}: Props): JSX.Element {
  return (
    <Row style={{ alignItems: 'center' }}>
      <Button
        aria-label="menu"
        color="inherit"
        icon={<MenuIcon />}
        onClick={toggleMenuVisibility}
        style={{ justifySelf: 'flex-start' }}
      />
      <Typography.Title>
        <CurrentIcon />
        &nbsp;
        {currentPage}
      </Typography.Title>
    </Row>
  )
}
