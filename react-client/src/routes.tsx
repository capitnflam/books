import HomeIcon from '@material-ui/icons/Home'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'

import Home from './containers/Home'
import Library from './containers/Library'
import { AppRoute } from './types'

const routes: AppRoute[] = [
  {
    component: Home,
    exact: true,
    icon: HomeIcon,
    name: 'Home',
    path: '/',
  },
  {
    component: Library,
    icon: LibraryBooksIcon,
    name: 'Library',
    path: '/library',
  },
]

export default routes
