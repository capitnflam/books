import { useParams } from 'react-router-dom'

type ParamsKey = 'id'

export function Author() {
  const { id } = useParams<ParamsKey>()
  return <div>Author: {id}</div>
}
