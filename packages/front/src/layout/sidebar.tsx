import { BookOpenIcon, PencilIcon } from '@heroicons/react/24/solid'
import { useLocation, useMatches } from 'react-router-dom'

type Props = {
  isOpen: boolean
}

export function Sidebar({ isOpen }: Props) {
  const location = useLocation()
  const matches = useMatches()
  const width = isOpen ? 'w-80' : 'w-8'

  return (
    <aside className={`bg-blue-900 text-slate-100 ${width}`}>
      <nav>
        <BookOpenIcon className="h-6 w-6" />
        <pre>{JSON.stringify(location, null, 2)}</pre>
        <PencilIcon className="h-6 w-6" />
        <pre>{JSON.stringify(matches, null, 2)}</pre>
      </nav>
    </aside>
  )
}
