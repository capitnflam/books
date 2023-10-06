import { useCallback, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark'

export const useTheme = (): [Theme, () => void, (theme: Theme) => void] => {
  const htmlElement = useMemo(
    () => document.getElementsByTagName('html')[0],
    [],
  )
  const initialTheme = useMemo(() => {
    const isLight = htmlElement.classList.contains('light')
    const isDark = htmlElement.classList.contains('dark')

    if (isLight && isDark) {
      htmlElement.classList.remove('dark')
      return 'light'
    }
    if (isLight) {
      return 'light'
    }
    if (isDark) {
      return 'dark'
    }
    htmlElement.classList.add('light')
    return 'light'
  }, [htmlElement.classList])
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const setTheme = useCallback(
    (theme: Theme) => {
      setThemeState(theme)
      htmlElement.classList.remove('light', 'dark')
      htmlElement.classList.add(theme)
    },
    [htmlElement.classList],
  )
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  return [theme, toggleTheme, setTheme]
}
