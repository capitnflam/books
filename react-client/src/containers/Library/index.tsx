import { Grid } from '@material-ui/core'
import React from 'react'

import Card from '../../components/Book/Card'

export default function Collection(): JSX.Element {
  return (
    <>
      <p>Library</p>
      <div style={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item>
            <Card />
          </Grid>
        </Grid>
      </div>
    </>
  )
}
