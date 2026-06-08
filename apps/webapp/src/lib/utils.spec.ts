import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-3xl', 'font-bold', 'text-3xl', 'underline')
      expect(result).toBe('font-bold text-3xl underline')
    })

    it('should handle falsy values', () => {
      // oxlint-disable-next-line no-constant-binary-expression vitest/no-conditional-in-test
      const result = cn('class1', false && 'class2', null, undefined, 'class3')
      expect(result).toBe('class1 class3')
    })
  })
})
