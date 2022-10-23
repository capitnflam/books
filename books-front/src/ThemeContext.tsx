import { createContext } from 'react'
import { atom, useRecoilState } from 'recoil'

import type { ReactNode } from 'react'
import type { SetterOrUpdater } from 'recoil'

interface Props {
  children: ReactNode
}

export type Theme = 'light' | 'dark'

interface Context {
  theme: Theme
  setTheme: SetterOrUpdater<Theme>
}

const themeState = atom<Theme>({
  key: 'themeState',
  default: 'light',
})

export const ThemeContext = createContext<Context | null>(null)

export const ThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useRecoilState(themeState)

  const defaultContext = { theme, setTheme }

  return (
    <ThemeContext.Provider value={defaultContext}>
      {children}
    </ThemeContext.Provider>
  )
}
