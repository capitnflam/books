import { Outlet } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'

export function Layout() {
  return (
    <div className="relative flex h-screen flex-col">
      <Header />
      <main className="container mx-auto max-w-7xl flex-grow px-6 py-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
