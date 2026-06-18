import { Inter } from 'next/font/google'

import { RootProvider } from '@/providers/RootProvider'

import type { PropsWithChildren } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

type RootLayoutProps = PropsWithChildren

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <RootProvider>
          <div>{children}</div>
        </RootProvider>
      </body>
    </html>
  )
}
