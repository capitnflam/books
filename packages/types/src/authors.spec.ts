import { z } from 'zod'

import { AuthorsResult, authorsResultSchema } from './authors'

type AuthorsResultInput = z.input<typeof authorsResultSchema>

const date = new Date()

const authorsResultFixture: AuthorsResultInput = [
  {
    id: 42,
    name: 'Author 1',
    createdAt: date,
    updatedAt: date,
  },
  {
    id: 43,
    name: 'Author 2',
    createdAt: date,
    updatedAt: date,
  },
  {
    id: 41,
    name: 'Author 3',
    createdAt: date,
    updatedAt: date,
  },
]

const authorsResultFixtureExpected: AuthorsResult = [
  {
    uri: '/author/42',
    name: 'Author 1',
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  },
  {
    uri: '/author/43',
    name: 'Author 2',
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  },
  {
    uri: '/author/41',
    name: 'Author 3',
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  },
]

describe('types::authors', () => {
  describe('result', () => {
    it('parses a valid object', () => {
      expect(authorsResultSchema.parse(authorsResultFixture)).toStrictEqual(
        authorsResultFixtureExpected,
      )
    })

    it('rejects an invalid object', () => {
      expect(() =>
        authorsResultSchema.parse([
          {
            uri: '/unknown/42',
            name: 'Author 1',
          },
        ]),
      ).toThrow()
    })
  })
})
