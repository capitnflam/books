import axios from 'axios'

import { BooksResult } from '~books/types'

export function getBooks(): Promise<BooksResult> {
  return axios.get(`/books`, { baseURL: '/api' }).then((res) => res.data)
}
