import { addDays } from './date'

describe('utils:date', () => {
  describe('addDays', () => {
    const originalDate = new Date(2020, 0, 1)
    const tests: Array<[number, Date]> = [
      [1, new Date(2020, 0, 2)],
      [31, new Date(2020, 1, 1)],
      [-10, new Date(2019, 11, 22)],
    ]

    test.each(tests)('should add %s days to a date', (days, expected) => {
      expect(addDays(originalDate, days)).toEqual(expected)
    })
  })
})
