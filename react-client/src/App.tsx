import { Layout } from 'antd'
import React, { useState } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import MainHeader from './components/MainHeader'
import MainMenu from './components/MainMenu'
import MainPage from './components/MainPage'
import { WarningIcon } from './icons'
import routes from './routes'

import './App.less'
import 'fontsource-roboto'

export default function App(): JSX.Element {
  const [menuVisibility, setMenuVisibility] = useState<boolean>(true)
  const toggleMenuVisibility = () => {
    setMenuVisibility(!menuVisibility)
  }
  const location = useLocation()
  const { Content, Footer, Header, Sider } = Layout

  const currentRoute = routes.find(
    (route) =>
      !!matchPath(location.pathname, {
        path: route.path,
        exact: !!route.exact,
      }),
  )
  const currentPage = currentRoute?.name || 'Unknown'
  const currentIcon = currentRoute?.icon || (() => <WarningIcon />)

  return (
    <Layout className="app-layout-main">
      <Header className="app-layout-header">
        <MainHeader
          currentIcon={currentIcon}
          currentPage={currentPage}
          toggleMenuVisibility={toggleMenuVisibility}
        />
      </Header>
      <Layout>
        <Sider
          className="app-layout-sider"
          width={menuVisibility ? 'fit-content' : 0}
        >
          <MainMenu routes={routes} showLabel />
        </Sider>
        <Content className="app-layout-content">
          <MainPage routes={routes} />
        </Content>
      </Layout>
      <Footer className="app-layout-footer">Footer</Footer>
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
    </Layout>
  )
}
