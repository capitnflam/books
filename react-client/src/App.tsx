import { Container, Drawer, Tooltip } from '@material-ui/core'

import React from 'react'
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'

import routes from './routes'

export default function App(): JSX.Element {
  return (
    <Router>
      <Container maxWidth={false}>
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
      </Container>
    </Router>
  )
}
