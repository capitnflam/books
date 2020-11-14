import { Container, CssBaseline } from '@material-ui/core'
import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import MainHeader from './components/MainHeader'
import MainMenu from './components/MainMenu'
import MainPage from './components/MainPage'
import routes from './routes'

import 'fontsource-roboto'

export default function App(): JSX.Element {
  const [menuVisibility, setMenuVisibility] = useState<boolean>(false)
  const toggleMenuVisibility = () => {
    setMenuVisibility(!menuVisibility)
  }

  return (
    <Router>
      <CssBaseline />
      <MainHeader toggleMenuVisibility={toggleMenuVisibility} />
      <Container maxWidth={false}>
        <MainMenu routes={routes} showLabel visible={menuVisibility} />
        <MainPage routes={routes} />
      </Container>
    </Router>
  )
}
