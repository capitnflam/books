import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { AppMenuRoute } from '../types'

interface Props {
  routes: AppMenuRoute[]
}

export default function MainPage({ routes }: Props): JSX.Element {
  return (
    <Switch>
      {routes.map((route, index) => {
        const RouteComponent = route.component
        return (
          <Route key={index} exact={!!route.exact} path={route.path}>
            <RouteComponent />
          </Route>
        )
      })}
    </Switch>
  )
}
