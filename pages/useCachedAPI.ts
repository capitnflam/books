import { useQuery, QueryKey } from 'react-query'
import axios, { AxiosRequestConfig } from 'axios'

export const useCachedAPI = (key: QueryKey, config: AxiosRequestConfig) => {
  const query = useQuery(key, async ({ signal }) => {
    const response = await axios(Object.assign({}, config, { signal }))
    return response.data
  })

  return query
}
