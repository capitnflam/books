import { Bars3Icon, BuildingLibraryIcon } from '@heroicons/react/24/outline'

export function Header() {
  return (
    <header className="h-8 flex items-center justify-between mx-1">
      <Bars3Icon className="h-6" />
      <div className="flex justify-start">
        <BuildingLibraryIcon className="h-6" /> Books
      </div>
    </header>
  )
}
