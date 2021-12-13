import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ScopedCssBaseline } from '@mui/material'

const queryClient = new QueryClient()

function BooksApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ScopedCssBaseline enableColorScheme>
        <Component {...pageProps} />
      </ScopedCssBaseline>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default BooksApp
