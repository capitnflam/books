import HomeIcon from '@material-ui/icons/Home'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'

import Collection from './containers/Collection'
import Home from './containers/Home'
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
    component: Collection,
    icon: LibraryBooksIcon,
    name: 'Collection',
    path: '/collection',
  },
]

export default routes
