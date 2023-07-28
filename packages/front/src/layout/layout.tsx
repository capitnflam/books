import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prevState => !prevState)
  }, [setIsSidebarOpen])

  return (
    <div className="flex h-screen w-screen flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-grow flex-row">
        <Sidebar isOpen={isSidebarOpen} />
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
 