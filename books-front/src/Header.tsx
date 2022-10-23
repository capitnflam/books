import { IconMoon, IconSun } from '@tabler/icons'

import { useTheme } from './useTheme'

export const Header = () => {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex flex-row bg-gray-50 px-2 py-2.5 dark:bg-gray-800">
      <img
        className="h-8 w-8 self-center"
        src="https://via.placeholder.com/32"
        alt="logo"
      />
      <span className="ml-2 self-center font-mono text-2xl font-bold text-gray-900 dark:text-white">
        Books
      </span>
      <button
        type="button"
        aria-hidden="true"
        className="ml-auto inline-flex items-center self-end rounded-full p-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white focus:outline-none dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
        onClick={toggle}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>
    </div>
  )
}
