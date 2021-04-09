import { BookFilled, FileAddFilled, HomeFilled } from '@ant-design/icons'

import Collections from './containers/Collections'
import Home from './containers/Home'
import Library from './containers/Library'
import { AppRoute } from './types'

const routes: AppRoute[] = [
  {
    component: Home,
    exact: true,
    icon: HomeFilled,
    name: 'Home',
    path: '/',
  },
  {
    component: Library,
    icon: BookFilled,
    name: 'Library',
    path: '/library',
  },
  {
    component: Collections,
    icon: FileAddFilled,
    name: 'Collections',
    path: '/collections',
  },
]

export default routes
