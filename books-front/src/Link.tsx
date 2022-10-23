import { Link as NavLink } from '@tanstack/react-location'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string | undefined
  external?: boolean
  to: string
}

export const Link = ({ children, className, external, to }: Props) => {
  const target = external ? '_blank' : '_self'

  if (to.startsWith('/')) {
    return (
      <NavLink to={to} target={target} className={className}>
        {children}
      </NavLink>
    )
  }

  return (
    <a href={to} target={target} className={className}>
      {children}
    </a>
  )
}
