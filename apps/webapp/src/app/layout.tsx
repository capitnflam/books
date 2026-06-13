import { Inter } from 'next/font/google'

import { cn } from '@/lib/utils'
import { QueryProvider } from '@/providers/QueryProvider'

import type { PropsWithChildren } from 'react'

import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

type RootLayoutProps = PropsWithChildren

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
