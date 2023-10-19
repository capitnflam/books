import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Footer } from './footer'
import { Header } from './header'

export function ErrorLayout() {
  const error = useRouteError()

  return (
    <div className="relative flex h-screen flex-col">
      <Header />
      <main className="container mx-auto max-w-7xl flex-grow px-6 pt-16">
        {isRouteErrorResponse(error) ? (
          <div>
            <p className="text-3xl">Oops!</p>
            <span className="text-2xl">
              {error.status} {error.statusText}
            </span>
            {error.data?.message && <p>{error.data.message}</p>}
          </div>
        ) : (
          <div>
            <span className="text-3xl">Oops!</span>
            <p>{JSON.stringify(error, null, 2)}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
