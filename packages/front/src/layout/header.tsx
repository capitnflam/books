import { Bars3Icon, BuildingLibraryIcon } from '@heroicons/react/24/outline'

export function Header() {
  return (
    <header className="mx-1 flex h-8 items-center justify-between">
      <Bars3Icon className="h-6" />
      <div className="flex justify-start">
        <BuildingLibraryIcon className="h-6" /> Books
      </div>
    </header>
  )
}
