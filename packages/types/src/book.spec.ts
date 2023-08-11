import { bookSchema } from './book'

const date = new Date()

const bookFixture = {
  id: 42,
  coverURL: 'http://foo.bar/cover.jpg',
  title: 'test',
  synopsis: 'test synopsis',
  isbn: '978-3-16-148410-0',
  authors: [
    {
      name: 'author 1',
      id: 21,
    },
  ],
  createdAt: date,
  updatedAt: date,
}

const bookFixtureResult = {
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
  createdAt: date.toISOString(),
  updatedAt: date.toISOString(),
}

describe('types::book', () => {
  it('parses a valid object', () => {
    expect(bookSchema.parse(bookFixture)).toStrictEqual(bookFixtureResult)
  })

  it('rejects an invalid object', () => {
    expect(() => bookSchema.parse({ foo: 42 })).toThrow()
  })
})
