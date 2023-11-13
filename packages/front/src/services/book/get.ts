import axios from 'axios'

import { BookResult } from '~books/types'

export function getBook(uri: string): Promise<BookResult> {
  return axios.get(uri, { baseURL: '/api' }).then((res) => res.data)
}
