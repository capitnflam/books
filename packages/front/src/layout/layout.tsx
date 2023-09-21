import { Outlet } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'

export function Layout() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Header />
      <div className="flex flex-grow flex-row">
        <Sidebar />
        <main className="w-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
