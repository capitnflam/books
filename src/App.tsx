import {
  AppShell,
  Button,
  MantineProvider,
  Navbar,
  Header,
} from '@mantine/core'
import { useState } from 'react'

export const App = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light')
  return (
    <MantineProvider
      theme={{
        colorScheme,
      }}
    >
      <AppShell
        padding="md"
        navbar={
          <Navbar width={{ base: 300 }} height={500}>
            <span>navbar</span>
            <Button
              onClick={() => {
                setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
              }}
            >
              Toggle theme
            </Button>
          </Navbar>
        }
        header={
          <Header height={60}>
            <span>header</span>
          </Header>
        }
      >
        <span>foo</span>
      </AppShell>
    </MantineProvider>
  )
}
