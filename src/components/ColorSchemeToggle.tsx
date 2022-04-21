import { ActionIcon, useMantineColorScheme } from '@mantine/core'
import { Sun, MoonStars } from 'tabler-icons-react'

export const ColorSchemeToggle = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <ActionIcon onClick={() => toggleColorScheme()}>
      {colorScheme === 'dark' ? <Sun /> : <MoonStars />}
    </ActionIcon>
  )
}
