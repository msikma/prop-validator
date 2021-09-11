// cmd-tokenize <https://github.com/msikma/cmd-tokenize>
// © MIT license

const { PropTypesValidatorErrorBase } = require('./error')
const { checkRange, inRange, formatRange, joinObjectPath } = require('./util')

describe(`prop-validator utilities`, () => {
  describe(`checkRange()`, () => {
    it(`returns true for a valid range and throws otherwise`, () => {
      expect(() => checkRange([1])).toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1], 'inclusive')).toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1], 'exclusive')).toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1, 3], 'greaterThan')).toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1, 3], 'greaterThanOrEqual')).toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1, 3], 'lessThan')).toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1, 3], 'lessThanOrEqual')).toThrow(PropTypesValidatorErrorBase)

      expect(() => checkRange([1, 3], 'inclusive')).not.toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1, 3], 'exclusive')).not.toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1], 'greaterThan')).not.toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1], 'greaterThanOrEqual')).not.toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1], 'lessThan')).not.toThrow(PropTypesValidatorErrorBase)
      expect(() => checkRange([1], 'lessThanOrEqual')).not.toThrow(PropTypesValidatorErrorBase)
      expect(checkRange([1, 3], 'inclusive')).toBe(true)
    })
  })
  describe(`inRange()`, () => {
    it(`checks if a given value falls within a given range and returns either true or false`, () => {
      expect(inRange([1, 3], 'inclusive', null, -1000)).toBe(false)
      expect(inRange([1, 3], 'inclusive', null, 0.9)).toBe(false)
      expect(inRange([1, 3], 'inclusive', null, 1)).toBe(true)
      expect(inRange([1, 3], 'inclusive', null, 1.5)).toBe(true)
      expect(inRange([1, 3], 'inclusive', null, 2)).toBe(true)
      expect(inRange([1, 3], 'inclusive', null, 3)).toBe(true)
      expect(inRange([1, 3], 'inclusive', null, 3.1)).toBe(false)
      expect(inRange([1, 3], 'inclusive', null, 1000)).toBe(false)

      expect(inRange([1, 3], 'exclusive', null, -1000)).toBe(false)
      expect(inRange([1, 3], 'exclusive', null, 0.5)).toBe(false)
      expect(inRange([1, 3], 'exclusive', null, 1)).toBe(false)
      expect(inRange([1, 3], 'exclusive', null, 1.5)).toBe(true)
      expect(inRange([1, 3], 'exclusive', null, 2)).toBe(true)
      expect(inRange([1, 3], 'exclusive', null, 3)).toBe(false)
      expect(inRange([1, 3], 'exclusive', null, 3.1)).toBe(false)
      expect(inRange([1, 3], 'exclusive', null, 1000)).toBe(false)

      expect(inRange([1], 'greaterThan', null, 0.9)).toBe(false)
      expect(inRange([1], 'greaterThan', null, 1)).toBe(false)
      expect(inRange([1], 'greaterThan', null, 2)).toBe(true)
      expect(inRange([1], 'greaterThan', null, 2.2)).toBe(true)

      expect(inRange([1], 'greaterThanOrEqual', null, 0.9)).toBe(false)
      expect(inRange([1], 'greaterThanOrEqual', null, 1)).toBe(true)
      expect(inRange([1], 'greaterThanOrEqual', null, 2)).toBe(true)
      expect(inRange([1], 'greaterThanOrEqual', null, 2.2)).toBe(true)

      expect(inRange([1], 'lessThan', null, 0)).toBe(true)
      expect(inRange([1], 'lessThan', null, 0.9)).toBe(true)
      expect(inRange([1], 'lessThan', null, 1)).toBe(false)
      expect(inRange([1], 'lessThan', null, 2)).toBe(false)
      expect(inRange([1], 'lessThan', null, 2.2)).toBe(false)

      expect(inRange([1], 'lessThanOrEqual', null, 0)).toBe(true)
      expect(inRange([1], 'lessThanOrEqual', null, 0.9)).toBe(true)
      expect(inRange([1], 'lessThanOrEqual', null, 1)).toBe(true)
      expect(inRange([1], 'lessThanOrEqual', null, 2)).toBe(false)
      expect(inRange([1], 'lessThanOrEqual', null, 2.2)).toBe(false)
    })
  })
  describe(`formatRange()`, () => {
    it(`correctly formats a range array`, () => {
      expect(formatRange([1, 3], 'inclusive')).toBe('1 ≤ n ≤ 3')
      expect(formatRange([1, 3], 'exclusive')).toBe('1 < n < 3')
      expect(formatRange([1], 'greaterThan')).toBe('n > 1')
      expect(formatRange([1], 'greaterThanOrEqual')).toBe('n ≥ 1')
      expect(formatRange([1], 'lessThan')).toBe('n < 1')
      expect(formatRange([1], 'lessThanOrEqual')).toBe('n ≤ 1')
    })
  })
  describe(`joinObjectPath()`, () => {
    it(`joins together an array of object keys into a formatted string`, () => {
      expect(joinObjectPath([])).toBe('')
      expect(joinObjectPath(['a'])).toBe('a')
      expect(joinObjectPath(['a', 'b'])).toBe('a.b')
      expect(joinObjectPath(['a', 0, 'b'])).toBe('a[0].b')
      expect(joinObjectPath(['a', 0, 1, 'b'])).toBe('a[0][1].b')
      expect(joinObjectPath(['a', 'ccc', 0, 'd', 1, 'b'])).toBe('a.ccc[0].d[1].b')
      expect(() => joinObjectPath('a')).toThrow(PropTypesValidatorErrorBase)
      expect(() => joinObjectPath(null)).toThrow(PropTypesValidatorErrorBase)
      expect(() => joinObjectPath([])).not.toThrow(PropTypesValidatorErrorBase)
    })
  })
})