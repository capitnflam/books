import axios from 'axios'

import { BooksResult } from '~books/types'

import { PageParam } from '../../types/page-param'

export function getBooks(pageParam: PageParam): Promise<BooksResult> {
  return axios
    .get(`/books`, { baseURL: '/api', params: pageParam })
    .then((res) => res.data)
}
