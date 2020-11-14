import { Grid, Drawer, Tooltip, Typography } from '@material-ui/core'
import React from 'react'
import { Link } from 'react-router-dom'

import { AppMenuInfo } from '../types'

interface Props {
  routes: AppMenuInfo[]
  showLabel: boolean
  visible: boolean
}

export default function MainMenu({
  routes,
  showLabel,
  visible,
}: Props): JSX.Element {
  return (
    <Drawer anchor="left" open={visible} variant="persistent">
      <Grid container direction="column" style={{ padding: 8 }}>
        {routes.map((route, index) => {
          const RouteIcon = route.icon
          return (
            <Link key={index} to={route.path}>
              <Tooltip title={route.name}>
                <Grid item>
                  <Typography noWrap>
                    <RouteIcon />
                    {showLabel && route.name}
                  </Typography>
                </Grid>
              </Tooltip>
            </Link>
          )
        })}
      </Grid>
    </Drawer>
  )
}
