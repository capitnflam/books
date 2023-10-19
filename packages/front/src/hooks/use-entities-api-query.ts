import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useEntitiesApiQuery<T>(
  type: string,
  options: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T>({
    ...options,
    queryKey: [type],
    queryFn: async ({ queryKey }) => {
      const [type] = queryKey
      const uri = `/${type}`

      return axios.get(uri, { baseURL: '/api' }).then((res) => res.data)
    },
  })
}
