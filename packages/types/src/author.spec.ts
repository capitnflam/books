import { authorSchema } from './author'

const date = new Date()

const authorFixture = {
  id: 42,
  name: 'Author 1',
  createdAt: date,
  updatedAt: date,
}

const authorFixtureResult = {
  uri: '/author/42',
  name: 'Author 1',
  createdAt: date.toISOString(),
  updatedAt: date.toISOString(),
}

describe('types::author', () => {
  it('parses a valid object', () => {
    expect(authorSchema.parse(authorFixture)).toStrictEqual(authorFixtureResult)
  })

  it('rejects an invalid object', () => {
    expect(() =>
      authorSchema.parse({
        uri: '/unknown/42',
        name: 'Author 1',
      }),
    ).toThrow()
  })
})
