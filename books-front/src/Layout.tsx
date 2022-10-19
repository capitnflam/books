import { ActionIcon, AppShell, Group, Header } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons'
import { ReactNode, useCallback } from 'react'
import { useRecoilState } from 'recoil'

import { darkModeState } from './atoms'
import { Navigation } from './Navigation'

interface Props {
  children: ReactNode
}

export const Layout = ({ children }: Props) => {
  const [darkMode, setDarkMode] = useRecoilState(darkModeState)
  const toggleDarkMode = useCallback(() => {
    setDarkMode((value) => !value)
  }, [setDarkMode])

  return (
    <AppShell
      navbar={<Navigation />}
      header={
        <Header height={60} p="xs">
          <Group grow dir="row">
            <Group>foo</Group>
            <ActionIcon
              sx={{ alignSelf: 'flex-end', flex: 0, marginLeft: 'auto' }}
              onClick={toggleDarkMode}
            >
              {darkMode ? <IconSun /> : <IconMoon />}
            </ActionIcon>
          </Group>
        </Header>
      }
    >
      {children}
    </AppShell>
  )
}
