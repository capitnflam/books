import { Button } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home'
import PlusOne from '@material-ui/icons/PlusOne'

import React, { useState } from 'react'

import Home from './containers/Home'
import { AppRoute } from './types'

const Foo = (): JSX.Element => {
  const [foo, setFoo] = useState<number>(0)

  const incFoo = () => {
    setFoo(foo + 1)
  }

  return (
    <div>
      <p>foo count: {foo}</p>
      <Button color="primary" onClick={incFoo} variant="contained">
        <PlusOne />
      </Button>
    </div>
  )
}

const routes: AppRoute[] = [
  {
    component: Home,
    exact: true,
    icon: HomeIcon,
    name: 'Home',
    path: '/',
  },
  {
    component: Foo,
    icon: PlusOne,
    name: 'Foo',
    path: '/foo',
  },
]

export default routes
