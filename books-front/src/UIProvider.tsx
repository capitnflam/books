import { MantineProvider, MantineThemeOverride } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
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

export const UIProvider = ({ children }: Props) => {
  const [darkMode] = useRecoilState(darkModeState)

  return (
    <MantineProvider
      theme={darkMode ? darkTheme : lightTheme}
      withGlobalStyles
      withNormalizeCSS
    >
      <NotificationsProvider>{children}</NotificationsProvider>
    </MantineProvider>
  )
}
