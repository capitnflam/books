import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useEntityApiQuery<T>(
  type: string,
  id: string | undefined,
  options: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
  if (id === undefined) {
    throw new Error('id is undefined')
  }
  return useQuery<T>({
    ...options,
    queryKey: [type, id],
    queryFn: async ({ queryKey }) => {
      const [type, id] = queryKey
      const uri = `/${type}/${id}`

      return axios.get(uri, { baseURL: '/api' }).then((res) => res.data)
    },
    enabled: (options.enabled ?? true) && id !== undefined,
  })
}
