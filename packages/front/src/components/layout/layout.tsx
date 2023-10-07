import { Outlet } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'

export function Layout() {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <div className="flex h-full w-full flex-grow flex-row space-x-1 overflow-hidden">
        <Sidebar />
        <main className="w-full overflow-y-auto p-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
