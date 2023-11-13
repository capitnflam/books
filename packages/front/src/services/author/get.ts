import axios from 'axios'

import { AuthorResult } from '~books/types'

export function getAuthor(uri: string): Promise<AuthorResult> {
  return axios.get(uri, { baseURL: '/api' }).then((res) => res.data)
}
