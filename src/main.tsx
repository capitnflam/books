import { CssBaseline } from '@mui/material'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { App } from './App'

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline enableColorScheme />
    <App />
  </React.StrictMode>,
  document.querySelector('#root'),
)
