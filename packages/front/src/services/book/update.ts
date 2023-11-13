import axios from 'axios'

import { BookRequest, BookResult } from '~books/types'

export function updateBook(book: BookRequest): Promise<BookResult> {
  return axios.put(book.uri, book, { baseURL: '/api' }).then((res) => res.data)
}
