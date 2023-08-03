import { bookSchema } from './book'

const bookFixture = {
  uri: '/book/42',
  coverURL: 'http://foo.bar/cover.jpg',
  title: 'test',
  synopsis: 'test synopsis',
  authors: [
    {
      name: 'author 1',
      uri: '/author/21',
    },
  ],
}

describe('types::book', () => {
  it('parses a valid object', () => {
    expect(bookSchema.parse(bookFixture)).toStrictEqual(bookFixture)
  })

  it('rejects an invalid object', () => {
    expect(() => bookSchema.parse({ foo: 42 })).toThrow()
  })
})
