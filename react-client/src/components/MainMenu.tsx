import { Col, Drawer, Row, Tooltip, Typography } from 'antd'

import React from 'react'
import { Link } from 'react-router-dom'

import { AppMenuInfo } from '../types'

interface Props {
  routes: AppMenuInfo[]
  showLabel: boolean
  visible: boolean
}

const drawerWidth = 180

export default function MainMenu({
  routes,
  showLabel,
  visible,
}: Props): JSX.Element {
  return (
    <Drawer visible={visible}>
      <Col>
        {routes.map((route, index) => {
          const RouteIcon = route.icon
          return (
            <Link key={index} to={route.path}>
              <Tooltip title={route.name}>
                <Row>
                  <Typography>
                    <RouteIcon />
                    {showLabel && route.name}
                  </Typography>
                </Row>
              </Tooltip>
            </Link>
          )
        })}
      </Col>
    </Drawer>
  )
}
