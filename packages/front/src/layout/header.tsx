import { Bars3Icon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'

import { useToggleSidebarOpen } from './state'

export function Header() {
  const toggleSidebar = useToggleSidebarOpen()
  const onClickHandler = useCallback(() => toggleSidebar(), [toggleSidebar])

  return (
    <header className="mx-1 flex h-8 items-center justify-between">
      <button type="button" onClick={onClickHandler}>
        <Bars3Icon className="h-6" />
      </button>
      <div className="flex justify-start">
        <BuildingLibraryIcon className="h-6" /> Books
      </div>
    </header>
  )
}
