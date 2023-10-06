import {
  Bars3Icon,
  BuildingLibraryIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useCallback, useMemo } from 'react'

import { useTheme } from '../../hooks/use-theme'

import { useToggleSidebarOpen } from './state'

export function Header() {
  const [theme, toggleTheme] = useTheme()
  const ThemeIcon = useMemo(() => {
    if (theme === 'dark') {
      return SunIcon
    }
    return MoonIcon
  }, [theme])
  const toggleSidebar = useToggleSidebarOpen()
  const onClickHandler = useCallback(() => toggleSidebar(), [toggleSidebar])

  return (
    <header className="mx-1 flex h-8 items-center justify-between">
      <button type="button" onClick={onClickHandler}>
        <Bars3Icon className="h-6" />
      </button>
      <div className="flex justify-start">
        <ThemeIcon
          className="h-6 hover:cursor-pointer"
          aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          onClick={toggleTheme}
        />
        <BuildingLibraryIcon className="h-6" />
      </div>
    </header>
  )
}
