import { Navbar, Stack } from '@mantine/core'
import { IconHome, IconSettings, IconLogout } from '@tabler/icons'

import { NavigationLink } from './NavigationLink'

export const Navigation = () => (
  <Navbar width={{ base: 80 }} p="xs">
    <Navbar.Section grow>
      <Stack justify="center" spacing={0}>
        <NavigationLink icon={IconHome} label="Home" path="/" />
        <NavigationLink icon={IconSettings} label="Settings" path="/settings" />
      </Stack>
    </Navbar.Section>
    <Navbar.Section>
      <Stack justify="center" spacing={0}>
        <NavigationLink icon={IconLogout} label="Logout" path="/logout" />
      </Stack>
    </Navbar.Section>
  </Navbar>
)
