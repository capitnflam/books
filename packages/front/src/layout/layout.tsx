import { Outlet } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'
import { Menu } from './menu'

export function Layout() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Header />
      <div className="flex flex-grow flex-row">
        <Menu />
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
