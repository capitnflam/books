import { MantineProvider, MantineThemeOverride } from '@mantine/core'
import { useRecoilState } from 'recoil'

import { darkModeState } from './atoms'

interface Props {
  children: React.ReactNode
}

const darkTheme: MantineThemeOverride = {
  colorScheme: 'dark',
}

const lightTheme: MantineThemeOverride = {
  colorScheme: 'light',
}

export const ThemeManager = ({ children }: Props) => {
  const [darkMode] = useRecoilState(darkModeState)

  return (
    <MantineProvider
      theme={darkMode ? darkTheme : lightTheme}
      withGlobalStyles
      withNormalizeCSS
    >
      {children}
    </MantineProvider>
  )
}
