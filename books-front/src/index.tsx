import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecoilRoot } from 'recoil'

import { UIProvider } from './UIProvider'
import { App } from './App'

const queryClient = new QueryClient()

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <UIProvider>
          <App />
        </UIProvider>
      </RecoilRoot>
    </QueryClientProvider>
  </React.StrictMode>,
)
