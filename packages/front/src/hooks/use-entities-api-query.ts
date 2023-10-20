import {
  InfiniteData,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query'
import axios from 'axios'

export function useEntitiesApiQuery<T extends InfiniteData<T, unknown>>(
  type: string,
  options: Omit<UseInfiniteQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
  return useInfiniteQuery<T>({
    ...options,
    queryKey: [type],
    queryFn: async ({ queryKey }) => {
      const [type] = queryKey
      const uri = `/${type}`

      return axios.get(uri, { baseURL: '/api' }).then((res) => res.data)
    },
  })
}
