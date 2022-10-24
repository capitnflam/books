import { IconHome, IconSettings } from '@tabler/icons'

import { Link } from './Link'
import { UserBadge } from './UserBadge'

export const Sidebar = () => {
  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="flex h-full flex-col overflow-y-auto bg-gray-50 py-4 px-3 dark:bg-gray-800">
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <IconHome />
              <span className="ml-3">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <IconSettings />
              <span className="ml-3">Settings</span>
            </Link>
          </li>
          <li>
            <Link
              to="/nonexistent"
              className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <IconSettings />
              <span className="ml-3">non existent</span>
            </Link>
          </li>
        </ul>
        <div className="mt-auto border-t pt-2">
          <UserBadge />
        </div>
      </div>
    </aside>
  )
}
