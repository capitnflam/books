import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { Switch } from '@nextui-org/react'

import { useTheme } from '../hooks/use-theme'

export function DarkToggle() {
  const [theme, toggleTheme] = useTheme()

  return (
    <Switch
      defaultSelected={theme === 'dark'}
      size="sm"
      color="secondary"
      startContent={<SunIcon />}
      endContent={<MoonIcon />}
      onValueChange={toggleTheme}
    >
      Dark mode
    </Switch>
  )
}
