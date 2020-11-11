import { Drawer, Tooltip } from '@material-ui/core'

import React from 'react'
import { Link } from 'react-router-dom'

import { AppMenuInfo } from '../types'

interface Props {
  routes: AppMenuInfo[]
}

export default function MainMenu({ routes }: Props): JSX.Element {
  return (
    <Drawer anchor="left" variant="permanent">
      {routes.map((route, index) => {
        const RouteIcon = route.icon
        return (
          <Link key={index} to={route.path}>
            <Tooltip title={route.name}>
              <RouteIcon />
            </Tooltip>
          </Link>
        )
      })}
    </Drawer>
  )
}
