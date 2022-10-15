import React from 'react'
import { createRoot } from 'react-dom/client'

const App = () => <div>Hello World!</div>

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
