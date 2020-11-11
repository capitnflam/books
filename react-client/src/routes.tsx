import { Button } from '@material-ui/core'
import { SvgIconComponent } from '@material-ui/icons'
import HomeIcon from '@material-ui/icons/Home'
import PlusOne from '@material-ui/icons/PlusOne'

import React, { useState } from 'react'

const Home = (): JSX.Element => <p>Home</p>

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

type AppRoute = {
  component: () => JSX.Element
  exact?: boolean
  icon: SvgIconComponent
  name: string
  path: string
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
