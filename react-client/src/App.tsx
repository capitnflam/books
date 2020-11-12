import { Container } from '@material-ui/core'

import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import MainMenu from './components/MainMenu'
import MainPage from './components/MainPage'
import routes from './routes'

export default function App(): JSX.Element {
  return (
    <Router>
      <Container maxWidth={false}>
        <MainMenu routes={routes} />
        <MainPage routes={routes} />
      </Container>
    </Router>
  )
}
