import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { Layout } from './Layout'
import { Provider } from './Provider'

function Index() {
  return <h1>Index</h1>
}

function Invoices() {
  return <h1>Invoices</h1>
}

function Dashboard() {
  return <h1>Dashboard</h1>
}

const container = document.querySelector('#root')
const root = createRoot(container!)
root.render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
