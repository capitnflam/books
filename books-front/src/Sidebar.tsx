import { IconHome, IconLogout, IconSettings } from '@tabler/icons'
import { Link } from '@tanstack/react-location'

import { PopOver } from './PopOver'

interface User {
  firstName: string
  lastName: string
  mail: string
  profilePicture?: string
}

// const user: User = {
//   profilePicture: 'https://via.placeholder.com/40',
//   firstName: 'John',
//   lastName: 'Doe',
//   mail: 'john.doe@acme.com',
// }

const user: User = {
  firstName: 'John',
  lastName: 'Doe',
  mail: 'john.doe@acme.com',
}

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
        </ul>
        <div className="mt-auto border-t pt-2">
          <PopOver
            render={({ closeAndDo }) => (
              <div className="my-4 flex flex-col overflow-y-auto rounded bg-gray-200 px-3 dark:bg-gray-600">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    onClick={closeAndDo(() => {
                      console.log('SignOut')
                    })}
                  >
                    <IconLogout />
                    <span className="ml-3">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          >
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              >
                {user.profilePicture ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.profilePicture}
                    alt="profile"
                  />
                ) : (
                  <div className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                )}

                <div className="font-medium dark:text-white">
                  <div>
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.mail}
                  </div>
                </div>
              </button>
            </div>
          </PopOver>
        </div>
      </div>
    </aside>
  )
}
