import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useTheme } from './useTheme'

interface Props {
  children: React.ReactNode
}

export const Layout = ({ children }: Props) => {
  const { className } = useTheme()

  return (
    <div className={`${className} flex h-screen w-screen flex-col`}>
      <Header />
      <div className="flex h-full flex-row bg-gray-50 dark:bg-gray-800">
        <Sidebar />
        <main className="flex h-full w-full flex-col overflow-auto rounded-tl-lg bg-green-200 p-3 dark:bg-red-200">
          {children}
        </main>
      </div>
    </div>
  )
}
