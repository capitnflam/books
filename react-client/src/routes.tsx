import Collections from './containers/Collections'
import Home from './containers/Home'
import Library from './containers/Library'
import { CollectionIcon, HomeIcon, LibraryIcon } from './icons'
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
    icon: LibraryIcon,
    name: 'Library',
    path: '/library',
  },
  {
    component: Collections,
    icon: CollectionIcon,
    name: 'Collections',
    path: '/collections',
  },
]

export default routes
