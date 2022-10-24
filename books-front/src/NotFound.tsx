import { useLocation } from '@tanstack/react-location'

export const NotFound = () => {
  const {
    current: { pathname },
  } = useLocation()

  return (
    <div className="m-auto">
      <figure className="max-w-lg">
        <img
          className="h-auto max-w-full rounded-lg"
          src="https://http.cat/404.jpg"
          alt="404 error"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          &apos;{pathname}&apos; not found!
        </figcaption>
      </figure>
    </div>
  )
}
