import { Bars3Icon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'

type Props = {
  toggleSidebar: () => void
}

export function Header({ toggleSidebar }: Props) {
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
