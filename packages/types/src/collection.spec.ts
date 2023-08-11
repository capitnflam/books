import { collectionSchema } from './collection'

const bookFixture = {
  uri: '/book/42',
  coverURL: 'http://foo.bar/cover.jpg',
  title: 'test',
  synopsis: 'test synopsis',
  isbn: '978-3-16-148410-0',
  authors: [
    {
      name: 'author 1',
      uri: '/author/21',
    },
  ],
}

const collectionFixture = {
  uri: '/collection/21',
  name: 'test collection',
  books: [bookFixture],
}

describe('types::collection', () => {
  it('parses a valid object', () => {
    expect(collectionSchema.parse(collectionFixture)).toStrictEqual(
      collectionFixture,
    )
  })

  it('rejects an invalid object', () => {
    expect(() => collectionSchema.parse({ foo: 42 })).toThrow()
  })
})
