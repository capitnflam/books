import { useParams } from 'react-router-dom'

import { RouteParams } from '../utils/route-params'

type ParamsKey = 'id'

export function Author() {
  const { id } = useParams<RouteParams<ParamsKey>>()
  return <div>Author: {id}</div>
}
