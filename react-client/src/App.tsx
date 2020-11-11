import { Container } from '@material-ui/core'

import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import MainMenu from './components/MainMenu'
import routes from './routes'

export default function App(): JSX.Element {
  return (
    <Router>
      <Container maxWidth={false}>
        <MainMenu routes={routes} />
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
