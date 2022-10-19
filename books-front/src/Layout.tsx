import {
  ActionIcon,
  AppShell,
  Group,
  Header,
  Image,
  useMantineColorScheme,
} from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons'
import { ReactNode, useCallback } from 'react'

import { Navigation } from './Navigation'

interface Props {
  children: ReactNode
}

export const Layout = ({ children }: Props) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const toggleScheme = useCallback(() => {
    toggleColorScheme()
  }, [toggleColorScheme])

  return (
    <AppShell
      navbar={<Navigation />}
      header={
        <Header height={60} p="xs">
          <Group grow dir="row">
            <Group>
              <Image
                alt="Books logo"
                src="https://via.placeholder.com/400"
                height={30}
                width={30}
                fit="fill"
              />
            </Group>

            <ActionIcon
              sx={{ alignSelf: 'flex-end', flex: 0, marginLeft: 'auto' }}
              onClick={toggleScheme}
            >
              {colorScheme === 'dark' ? <IconSun /> : <IconMoon />}
            </ActionIcon>
          </Group>
        </Header>
      }
    >
      {children}
    </AppShell>
  )
}
