import { Outlet } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'
import { Menu } from './menu'

export function Layout() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="flex flex-row flex-grow">
        <Menu />
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
