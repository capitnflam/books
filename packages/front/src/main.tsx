import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { App } from './app'
import { Layout } from './layout'

import './index.css'

const router = createBrowserRouter([
  {
    element: <Layout />,
    path: '/',
    children: [{ element: <App />, path: '/' }],
  },
])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
