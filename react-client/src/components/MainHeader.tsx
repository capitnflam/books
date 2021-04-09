import { MenuOutlined } from '@ant-design/icons'

import { Button } from 'antd'
import React from 'react'

interface Props {
  toggleMenuVisibility: () => void
}

export default function MainHeader({
  toggleMenuVisibility,
}: Props): JSX.Element {
  return (
    // <AppBar position="fixed">
    //   <Toolbar variant="dense">
    <div>
      <div>
        <Button
          aria-label="menu"
          color="inherit"
          // edge="start"
          onClick={toggleMenuVisibility}
        >
          <MenuOutlined />
        </Button>
      </div>
    </div>
    //   </Toolbar>
    // </AppBar>
  )
}
