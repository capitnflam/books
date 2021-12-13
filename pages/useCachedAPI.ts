import { useQuery, QueryKey } from 'react-query'
import axios, { AxiosRequestConfig } from 'axios'

export const useCachedAPI = <T>(key: QueryKey, config: AxiosRequestConfig) => {
  const query = useQuery<T>(key, async ({ signal }) => {
    const response = await axios(Object.assign({}, config, { signal }))
    return response.data
  })

  return query
}
