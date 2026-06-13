import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import type { PropsWithChildren } from 'react'

type QueryProviderProps = PropsWithChildren

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient, setQueryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
