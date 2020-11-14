import { AppBar, IconButton, Toolbar } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import React from 'react'

interface Props {
  toggleMenuVisibility: () => void
}

export default function MainHeader({
  toggleMenuVisibility,
}: Props): JSX.Element {
  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <IconButton
          aria-label="menu"
          color="inherit"
          edge="start"
          onClick={toggleMenuVisibility}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
