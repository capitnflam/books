import { Outlet, Router, ReactLocation } from '@tanstack/react-location'

import { NotFound } from './Components/NotFound'
import { Layout } from './Layout'
import { Home } from './Pages/Home'

export const App = () => {
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
      <Layout>
        <Outlet />
      </Layout>
    </Router>
  )
}
