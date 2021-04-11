import { IconType } from './icons'

export type AppMenuCommon = { path: string }

export type AppMenuInfo = AppMenuCommon & {
  icon: IconType
  name: string
}

export type AppMenuRoute = AppMenuCommon & {
  component: () => JSX.Element
  exact?: boolean
}

export type AppRoute = AppMenuInfo & AppMenuRoute
