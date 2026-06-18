import { QueryProvider } from './QueryProvider'

import type { PropsWithChildren } from 'react'

type RootProviderProps = PropsWithChildren

export function RootProvider({ children }: RootProviderProps) {
  return <QueryProvider>{children}</QueryProvider>
}
