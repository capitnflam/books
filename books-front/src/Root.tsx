import { Outlet, ReactLocation, Router } from '@tanstack/react-location'

import { Home } from './Home'
import { Layout } from './Layout'
import { NotFound } from './NotFound'
import { ThemeProvider } from './ThemeContext'

export const Root = () => {
  const location = new ReactLocation()

  return (
    <Router
      location={location}
      routes={[
        {
          path: '/',
          element: <Home />,
        },
        { path: '/settings', element: 'settings' },
        { path: '/*', element: <NotFound /> },
      ]}
    >
      <ThemeProvider>
        <Layout>
          <Outlet />
        </Layout>
      </ThemeProvider>
    </Router>
  )
}
