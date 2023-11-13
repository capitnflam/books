import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// import { Footer } from './footer'
import { useTheme } from '../../hooks/use-theme'

import { Header } from './header'

export function Layout() {
  const [theme] = useTheme()

  return (
    <div className="relative flex h-screen flex-col">
      <Header />
      <main className="container mx-auto max-w-7xl flex-grow px-6 py-16">
        <Outlet />
      </main>
      {/* <Footer /> */}
      <ToastContainer position="bottom-center" theme={theme} />
    </div>
  )
}
