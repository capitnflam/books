import { collectionSchema } from './collection'

const date = new Date()

const collectionFixture = {
  id: 21,
  name: 'test collection',
  books: ['/book/42'],
  createdAt: date,
  updatedAt: date,
}

const collectionFixtureResult = {
  uri: '/collection/21',
  name: 'test collection',
  books: ['/book/42'],
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
