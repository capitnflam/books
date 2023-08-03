import { RouteObject } from 'react-router-dom'

import { Book } from './book'

export const route: RouteObject = { element: <Book />, path: 'book/:id' }
