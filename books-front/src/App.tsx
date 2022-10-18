import { Outlet, Router, ReactLocation } from '@tanstack/react-location'
import { useRecoilState } from 'recoil'

import { darkModeState } from './atoms'

export const App = () => {
  const location = new ReactLocation()
  const [darkMode, setDarkMode] = useRecoilState(darkModeState)

  return (
    <Router
      location={location}
      routes={[
        { path: '/', element: 'Hello World!' },
        { path: 'foo', element: 'Hello foo!' },
        {
          path: 'bar',
          element: (
            <>
              <button
                onClick={() => {
                  console.log('darkMode', darkMode)
                  setDarkMode((currentValue) => !currentValue)
                }}
              >
                Toggle
              </button>
            </>
          ),
        },
      ]}
    >
      <Outlet />
    </Router>
  )
}
