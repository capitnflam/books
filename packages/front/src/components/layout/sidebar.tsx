import { BookOpenIcon, PencilIcon } from '@heroicons/react/24/solid'
import { useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { sidebarOpenState } from './state'

export function Sidebar() {
  const location = useLocation()
  // const matches = useMatches()
  const isOpen = useRecoilValue(sidebarOpenState)
  const width = isOpen ? 'w-auto' : 'w-8 overflow-hidden'

  return (
    <aside className="bg-blue-900 p-2 text-slate-100">
      <nav className={width}>
        <div className="flex flex-col items-baseline">
          <BookOpenIcon className="h-6 w-6" />
          <pre>{JSON.stringify(location, null, 2)}</pre>
          <PencilIcon className="h-6 w-6" />
          {/* <pre>{JSON.stringify(matches, null, 2)}</pre> */}
        </div>
      </nav>
    </aside>
  )
}
