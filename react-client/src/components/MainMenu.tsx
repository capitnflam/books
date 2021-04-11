import { Menu } from 'antd'

import React from 'react'
import { useHistory } from 'react-router-dom'

import { AppMenuInfo } from '../types'

interface Props {
  routes: AppMenuInfo[]
  showLabel: boolean
}

export default function MainMenu({ routes, showLabel }: Props): JSX.Element {
  const history = useHistory()

  return (
    <Menu>
      {routes.map((route, index) => {
        const RouteIcon = route.icon
        return (
          <Menu.Item
            key={index}
            icon={<RouteIcon />}
            onClick={() => history.push(route.path)}
          >
            {showLabel && route.name}
          </Menu.Item>
        )
      })}
    </Menu>
  )
}
