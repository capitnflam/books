import { useState } from 'react'
import { Navbar, Center, Image, Stack } from '@mantine/core'
import {
  IconHome2,
  IconGauge,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconCalendarStats,
  IconUser,
  IconSettings,
  IconLogout,
  IconSwitchHorizontal,
} from '@tabler/icons'

import { NavigationLink } from './NavigationLink'

const mockdata = [
  { icon: IconHome2, label: 'Home' },
  { icon: IconGauge, label: 'Dashboard' },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
  { icon: IconCalendarStats, label: 'Releases' },
  { icon: IconUser, label: 'Account' },
  { icon: IconFingerprint, label: 'Security' },
  { icon: IconSettings, label: 'Settings' },
]

export const Navigation = () => {
  const [active, setActive] = useState(2)

  const links = mockdata.map((link, index) => (
    <NavigationLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ))

  return (
    <Navbar width={{ base: 80 }} p="xs">
      <Center>
        <Image
          alt="Books logo"
          src="https://via.placeholder.com/400"
          height={30}
          width={30}
          fit="fill"
        />
      </Center>
      <Navbar.Section grow mt={50}>
        <Stack justify="center" spacing={0}>
          {links}
        </Stack>
      </Navbar.Section>
      <Navbar.Section>
        <Stack justify="center" spacing={0}>
          <NavigationLink icon={IconSwitchHorizontal} label="Change account" />
          <NavigationLink icon={IconLogout} label="Logout" />
        </Stack>
      </Navbar.Section>
    </Navbar>
  )
}
