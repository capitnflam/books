import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

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
      <MainHeader toggleMenuVisibility={toggleMenuVisibility} />
      <div>
        <MainMenu routes={routes} showLabel visible={menuVisibility} />
        <MainPage routes={routes} />
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  )
}
