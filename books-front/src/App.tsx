import { Outlet, Router, ReactLocation } from '@tanstack/react-location'

export const App = () => {
  const location = new ReactLocation()

  return (
    <Router
      location={location}
      routes={[
        {
          path: '/',
          element: (
            <div>
              <h1 className="text-3xl font-bold underline">Hellorld!</h1>
            </div>
          ),
        },
        { path: '/settings', element: 'settings' },
        { path: '/*', element: 'not found' },
      ]}
    >
      <Outlet />
    </Router>
  )
}
