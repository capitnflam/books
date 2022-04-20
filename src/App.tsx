import { AppShell, Navbar, Header } from '@mantine/core'

export const App = () => {
  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 300 }} height={500} padding="xs">
          <span>navbar</span>
        </Navbar>
      }
      header={
        <Header height={60} padding="xs">
          <span>header</span>
        </Header>
      }
    >
      <span>foo</span>
    </AppShell>
  )
}
