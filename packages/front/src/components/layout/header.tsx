import { BuildingLibraryIcon } from '@heroicons/react/24/outline'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link as NextUILink,
  // NavbarMenu,
  // NavbarMenuItem,
  // NavbarMenuToggle,
} from '@nextui-org/react'
import { useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { startsWithPlural } from '../../utils/starts-with-plural'
import { DarkToggle } from '../dark-toggle'

export function Header() {
  const { pathname: currentPathname } = useLocation()
  const isActive = useCallback(
    (pathname: string) => {
      return (
        pathname === currentPathname ||
        startsWithPlural(currentPathname, pathname)
      )
    },
    [currentPathname],
  )

  return (
    <Navbar
      maxWidth="full"
      position="sticky"
      isBordered
      classNames={{
        item: [
          'data-[active=true]:border-b',
          'data-[active=true]:border-secondary',
        ],
      }}
    >
      <NavbarBrand>
        <NextUILink as={Link} to="/" color="foreground" aria-label="Home">
          <BuildingLibraryIcon className="h-9" />
        </NextUILink>
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem isActive={isActive('/collections')}>
          <NextUILink as={Link} to="/collections">
            Collections
          </NextUILink>
        </NavbarItem>
        <NavbarItem isActive={isActive('/books')}>
          <NextUILink as={Link} to="/books">
            Books
          </NextUILink>
        </NavbarItem>
        <NavbarItem isActive={isActive('/authors')}>
          <NextUILink as={Link} to="/authors">
            Authors
          </NextUILink>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <DarkToggle />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
