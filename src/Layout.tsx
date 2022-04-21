import { AppShell, Navbar, Header, Container } from '@mantine/core'
import { Outlet } from 'react-router-dom'

import { ColorSchemeToggle } from './components/ColorSchemeToggle'

export const Layout = () => {
  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 300 }} height={500}>
          <span>navbar</span>
        </Navbar>
      }
      header={
        <Header height={60}>
          <Container fluid>
            header
            <ColorSchemeToggle />
          </Container>
        </Header>
      }
    >
      <div className="content">
        <Outlet />
      </div>
    </AppShell>
  )
}
