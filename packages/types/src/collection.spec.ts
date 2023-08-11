import { collectionSchema } from './collection'

const date = new Date()

const bookFixture = {
  id: 42,
  coverURL: 'http://foo.bar/cover.jpg',
  title: 'test',
  isbn: '978-3-16-148410-0',
}

const collectionFixture = {
  id: 21,
  name: 'test collection',
  books: [bookFixture],
  createdAt: date,
  updatedAt: date,
}

const bookFixtureResult = {
  uri: '/book/42',
  coverURL: 'http://foo.bar/cover.jpg',
  title: 'test',
  isbn: '978-3-16-148410-0',
}

const collectionFixtureResult = {
  uri: '/collection/21',
  name: 'test collection',
  books: [bookFixtureResult],
  createdAt: date.toISOString(),
  updatedAt: date.toISOString(),
}

describe('types::collection', () => {
  it('parses a valid object', () => {
    expect(collectionSchema.parse(collectionFixture)).toStrictEqual(
      collectionFixtureResult,
    )
  })

  it('rejects an invalid object', () => {
    expect(() => collectionSchema.parse({ foo: 42 })).toThrow()
  })
})
