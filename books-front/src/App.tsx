import { Outlet, Router, ReactLocation } from '@tanstack/react-location'

import { NotFound } from './Components/NotFound'
import { Layout } from './Layout'

export const App = () => {
  const location = new ReactLocation()

  return (
    <Router
      location={location}
      routes={[
        {
          path: '/',
          element: 'Hellorld!',
        },
        { path: '/foo', element: 'Hello foo!' },
        { path: '/*', element: <NotFound /> },
      ]}
    >
      <Layout>
        <Outlet />
      </Layout>
    </Router>
  )
}
