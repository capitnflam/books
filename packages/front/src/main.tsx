import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './app/app'

import './index.css'

const router = createBrowserRouter([{ element: <App />, path: '/' }])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
