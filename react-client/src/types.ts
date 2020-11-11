import { SvgIconComponent } from '@material-ui/icons'

export type AppMenuInfo = {
  icon: SvgIconComponent
  name: string
  path: string
}

export type AppRoute = AppMenuInfo & {
  component: () => JSX.Element
  exact?: boolean
}
