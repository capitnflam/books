export type AppMenuCommon = { path: string }

export type AppMenuInfo = AppMenuCommon & {
  icon: any
  name: string
}

export type AppMenuRoute = AppMenuCommon & {
  component: () => JSX.Element
  exact?: boolean
}

export type AppRoute = AppMenuInfo & AppMenuRoute
