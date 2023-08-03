import { authorSchema } from './author'

const authorFixture = {
  uri: '/author/42',
  name: 'Author 1',
}

describe('types::author', () => {
  it('parses a valid object', () => {
    expect(authorSchema.parse(authorFixture)).toStrictEqual(authorFixture)
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
