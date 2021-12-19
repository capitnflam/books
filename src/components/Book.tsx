import React, { useCallback, useState } from 'react'
import {
  Card,
  CardActions,
  CardHeader,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

import { IBook } from '../types'

import { ExpandMore } from './ExpandMore'

type Props = IBook & {
  cover?: string
}

export const Book = ({ authors, cover, isbn, synopsis, title }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleIsExpanded = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  return (
    <Card sx={{ maxWidth: 250 }}>
      <CardHeader
        title={title}
        subheader={
          <>
            <Stack direction="row" spacing={1}>
              {authors.map((elt) => {
                return (
                  <Link
                    key={elt}
                    href={`https://www.google.com/search?q=${elt.replace(
                      ' ',
                      '+',
                    )}`}
                  >
                    {elt}
                  </Link>
                )
              })}
            </Stack>
            <Chip label={isbn} clickable />
          </>
        }
      />
      {cover && (
        <CardMedia
          component="img"
          image={cover}
          alt={title ? `"${title}"'s cover` : 'cover'}
        />
      )}
      {/* <CardContent>{JSON.stringify(authors, undefined, 2)}</CardContent> */}
      <CardActions>
        <ExpandMore
          isExpanded={isExpanded}
          onClick={toggleIsExpanded}
          aria-expanded={isExpanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography title="Synopsis">{synopsis}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  )
}
