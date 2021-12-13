import type { NextPage } from 'next'

import { CircularProgress } from '@mui/material'
import { useCachedAPI } from './useCachedAPI'
import '../styles/Home.module.css'

const Home: NextPage = () => {
  const { isLoading, data } = useCachedAPI<{ name: string }>('hello', {
    method: 'GET',
    url: '/api/hello',
  })
  if (isLoading) {
    return <CircularProgress />
  }

  return <span>{data?.name}</span>
}

export default Home
