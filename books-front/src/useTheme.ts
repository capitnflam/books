import { useCallback, useContext } from 'react'

import { Theme, ThemeContext } from './ThemeContext'

export const useTheme = () => {
  const themeContext = useContext(ThemeContext)

  const set = useCallback(
    (newTheme: Theme) => {
      themeContext?.setTheme(newTheme)
    },
    [themeContext],
  )
  const toggle = useCallback(() => {
    themeContext?.setTheme(themeContext?.theme === 'light' ? 'dark' : 'light')
  }, [themeContext])

  const className = themeContext?.theme === 'dark' ? 'dark' : ''

  return { theme: themeContext?.theme, className, set, toggle }
}
