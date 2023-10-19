import { startsWithPlural } from './starts-with-plural'

describe('startsWithPlural', () => {
  it('should return true if the first pathname starts with the second one (singular)', () => {
    const result = startsWithPlural('/books/123', '/book')
    expect(result).toBe(true)
  })

  it('should return true if the first pathname starts with the second one (plural)', () => {
    const result = startsWithPlural('/books/123', '/books')
    expect(result).toBe(true)
  })

  it('should return false if the first pathname does not start with the second one (singular)', () => {
    const result = startsWithPlural('/books/123', '/author')
    expect(result).toBe(false)
  })

  it('should return false if the first pathname does not start with the second one (plural)', () => {
    const result = startsWithPlural('/books/123', '/authors')
    expect(result).toBe(false)
  })

  it('should return true if the first pathname starts with the second one (singular vs plural)', () => {
    const result = startsWithPlural('/book/123', '/books')
    expect(result).toBe(true)
  })

  it('should return true if the first pathname starts with the second one (plural vs singular)', () => {
    const result = startsWithPlural('/books/123', '/book')
    expect(result).toBe(true)
  })
})
