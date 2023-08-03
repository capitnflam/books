import { RouteObject } from 'react-router-dom'

import { LoremIpsum } from './lorem-ipsum'

export function App() {
  return (
    <div className="bg-red-700">
      <LoremIpsum />
    </div>
  )
}

export const route: RouteObject = { element: <App />, index: true }
