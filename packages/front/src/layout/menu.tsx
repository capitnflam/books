import { useLocation, useMatches } from 'react-router-dom'

export function Menu() {
  const location = useLocation()
  const matches = useMatches()

  return (
    <aside className="bg-blue-900 text-slate-100">
      <nav>
        <pre>{JSON.stringify(location, null, 2)}</pre>
        <pre>{JSON.stringify(matches, null, 2)}</pre>
      </nav>
    </aside>
  )
}
