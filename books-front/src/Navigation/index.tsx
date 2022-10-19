import { Navbar, Stack } from '@mantine/core'
import { IconHome, IconSettings, IconLogout } from '@tabler/icons'
import { useLocation, useNavigate } from '@tanstack/react-location'

import { NavigationLink } from './NavigationLink'

const mockdata = [
  { icon: IconHome, label: 'Home', path: '/' },
  { icon: IconSettings, label: 'Settings', path: '/settings' },
]

export const Navigation = () => {
  const {
    current: { pathname },
  } = useLocation()
  const navigate = useNavigate()

  const links = mockdata.map((link) => (
    <NavigationLink
      icon={link.icon}
      label={link.label}
      key={link.label}
      active={link.path === pathname}
      onClick={() => {
        navigate({ to: link.path })
      }}
    />
  ))

  return (
    <Navbar width={{ base: 80 }} p="xs">
      <Navbar.Section grow>
        <Stack justify="center" spacing={0}>
          {links}
        </Stack>
      </Navbar.Section>
      <Navbar.Section>
        <Stack justify="center" spacing={0}>
          <NavigationLink icon={IconLogout} label="Logout" />
        </Stack>
      </Navbar.Section>
    </Navbar>
  )
}
