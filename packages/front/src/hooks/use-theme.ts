import { useCallback, useEffect, useMemo } from 'react'
import { useDarkMode } from 'usehooks-ts'

export type Theme = 'light' | 'dark'

export const useTheme = (): [Theme, () => void, (theme: Theme) => void] => {
  const htmlElement = useMemo(
    () => document.getElementsByTagName('html')[0],
    [],
  )
  const { isDarkMode, disable, enable, toggle } = useDarkMode()
  const setTheme = useCallback(
    (theme: Theme) => {
      if (theme === 'light') {
        disable()
      } else {
        enable()
      }
    },
    [disable, enable],
  )
  const theme = useMemo(() => (isDarkMode ? 'dark' : 'light'), [isDarkMode])

  useEffect(() => {
    htmlElement.classList.remove('light', 'dark')
    htmlElement.classList.add(isDarkMode ? 'dark' : 'light')
  }, [htmlElement.classList, isDarkMode])

  return [theme, toggle, setTheme]
}
