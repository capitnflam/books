import { Outlet } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'

export function Layout() {
  return (
    <div className="flex h-full w-full flex-col">
      <Header />
      <div className="flex h-full w-full flex-grow flex-row">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
