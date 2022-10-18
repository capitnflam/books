import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecoilRoot } from 'recoil'

import { ThemeManager } from './ThemeManager'

interface Props {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export const Providers = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <ThemeManager>{children}</ThemeManager>
      </RecoilRoot>
    </QueryClientProvider>
  )
}
