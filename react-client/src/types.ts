import { SvgIconComponent } from '@material-ui/icons'

export type AppMenuCommon = { path: string }

export type AppMenuInfo = AppMenuCommon & {
  icon: SvgIconComponent
  name: string
}

export type AppMenuRoute = AppMenuCommon & {
  component: () => JSX.Element
  exact?: boolean
}

export type AppRoute = AppMenuInfo & AppMenuRoute
