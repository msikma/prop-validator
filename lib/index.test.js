// cmd-tokenize <https://github.com/msikma/cmd-tokenize>
// © MIT license

const { validateProps } = require('./index')
const { PropTypesValidatorErrorBase } = require('./error')
const PropTypes = require('./proptypes')

class TestClassBase {
  constructor() {
    const z = 4 + 4
  }
  helloWorld() {
    console.log('hello world')
  }
}

class TestClassA extends TestClassBase {
  constructor() {
    super()
  }
  helloWorld() {
    console.log('hi world')
  }
}

const validTypeCheck = (values = {}) => {
  return { errors: [], isValid: true, ...values }
}
const invalidTypeCheck = (values = {}) => {
  return { isValid: false, ...values }
}
const validResult = (key, types, values = {}) => {
  return {
    exception: null,
    isValid: true,
    key,
    message: null,
    objectPathList: [key],
    valueExpectedType: types.join(' | '),
    valueExpectedTypeList: types,
    ...values
  }
}
const invalidResult = (key, types, values = {}) => {
  return {
    ...validResult(key, types, values),
    isValid: false,
    ...values
  }
}

const prefix = `PropTypes`

describe(`prop-validator package`, () => {
  describe(`validateProps()`, () => {
    it(`correctly validates basic types`, () => {
      const valid = [
        validateProps({
          a: PropTypes.string,
          b: PropTypes.number,
          c: PropTypes.integer,
          d: PropTypes.boolean,
          e: PropTypes.function,
          f: PropTypes.object,
          g: PropTypes.array,
          h: PropTypes.symbol,
          i: PropTypes.regex,
          j: PropTypes.any
        }, {
          a: 'hello',
          b: 123.123,
          c: 10,
          d: false,
          e: () => { console.log('hi'); },
          f: { a: 'b' },
          g: ['a', 'b', 'c'],
          h: Symbol('hello world'),
          i: /[0-9]+/g,
          j: 'whatever'
        }),
        validateProps({
          q: PropTypes.numberRange(-1.2, 5),
          w: PropTypes.integerRange(-1.2, 5),
          e: PropTypes.stringMatching(/a|b/),
          r: PropTypes.oneOf(['qwerty', 'azerty']),
          t: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          y: PropTypes.arrayOf(PropTypes.string),
          u: PropTypes.objectOf(PropTypes.number),
          i: PropTypes.instanceOf(TestClassA),
          o: PropTypes.customProp((value, key, object, state, parentInfo) => typeof value === 'string' || value === 5, 'Any string or number 5'),
          p: PropTypes.shape({
            a: PropTypes.string,
            b: PropTypes.number
          }),
          a: PropTypes.exact({
            a: PropTypes.string,
            b: PropTypes.number
          })
        }, {
          q: 2.2,
          w: 2,
          e: 'a',
          r: 'qwerty',
          t: 5,
          y: ['a', 'b', 'c'],
          u: { a: 4, b: 5 },
          i: new TestClassA(),
          o: 5,
          p: {
            a: 'a',
            b: 5,
            c: 'anything'
          },
          a: {
            a: 'a',
            b: 5
          }
        })
      ]
      const invalid = [
        validateProps({
          a: PropTypes.string,
          b: PropTypes.number,
          c: PropTypes.integer,
          d: PropTypes.boolean,
          e: PropTypes.function,
          f: PropTypes.object,
          g: PropTypes.array,
          h: PropTypes.symbol,
          i: PropTypes.regex,
          j: PropTypes.any.isRequired
        }, {
          a: 4,
          b: 'a',
          c: 23.34,
          d: [],
          e: {},
          f: () => true,
          g: Symbol('nah'),
          h: /[0-9]+/,
          i: new TestClassA(),
          j: undefined
        })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      const invalidProps1 = validateProps({ a: PropTypes.string, b: PropTypes.number, c: PropTypes.integer }, { a: 'hello', b: 10, c: 10.50 })
      expect(invalidProps1).toMatchObject(invalidTypeCheck())
      expect(invalidProps1.errors).toHaveLength(1)
      expect(invalidProps1.results).toHaveLength(3)

      const invalidProps2 = validateProps({ a: PropTypes.string, b: PropTypes.number, c: PropTypes.integer.isRequired }, { a: 'hello', b: 10 })
      expect(invalidProps2).toMatchObject(invalidTypeCheck())
      expect(invalidProps2.errors).toHaveLength(1)
      expect(invalidProps2.results).toHaveLength(3)

      const validProps1 = validateProps({
        a: PropTypes.string,
        b: PropTypes.shape({
          a: PropTypes.string,
          b: PropTypes.shape({
            a: PropTypes.shape({
              a: PropTypes.number,
              b: PropTypes.string
            }),
            b: PropTypes.arrayOf(PropTypes.shape({
              a: PropTypes.string,
              b: PropTypes.number,
              c: PropTypes.stringMatching(/a|b/)
            }))
          })
        })
      }, {
        a: 'aaa',
        b: {
          a: 'aaa',
          b: {
            a: {
              a: 234,
              b: 'bbb'
            },
            b: [
              { a: 'aaa', b: 3, c: 'a' },
              { a: 'aa', b: 4, c: 'a' },
              { a: 'a', b: 5, c: 'b' },
              { a: 'aa', b: 76, c: 'a' },
              { a: 'aaa', b: 77, c: 'b' }
            ]
          }
        }
      })
      expect(validProps1).toMatchObject(validTypeCheck())
      expect(validProps1.results).toHaveLength(23)
      expect(validProps1.results[0].objectPath).toBe('a')
      expect(validProps1.results[1].objectPath).toBe('b')
      expect(validProps1.results[2].objectPath).toBe('b.a')
      expect(validProps1.results[3].objectPath).toBe('b.b')
      expect(validProps1.results[4].objectPath).toBe('b.b.a')
      expect(validProps1.results[5].objectPath).toBe('b.b.a.a')
      expect(validProps1.results[6].objectPath).toBe('b.b.a.b')
      expect(validProps1.results[7].objectPath).toBe('b.b.b')
      expect(validProps1.results[8].objectPath).toBe('b.b.b[0].a')
      expect(validProps1.results[9].objectPath).toBe('b.b.b[0].b')
      expect(validProps1.results[10].objectPath).toBe('b.b.b[0].c')
      expect(validProps1.results[11].objectPath).toBe('b.b.b[1].a')
      expect(validProps1.results[12].objectPath).toBe('b.b.b[1].b')
      expect(validProps1.results[13].objectPath).toBe('b.b.b[1].c')
      expect(validProps1.results[14].objectPath).toBe('b.b.b[2].a')
      expect(validProps1.results[15].objectPath).toBe('b.b.b[2].b')
      expect(validProps1.results[16].objectPath).toBe('b.b.b[2].c')
      expect(validProps1.results[17].objectPath).toBe('b.b.b[3].a')
      expect(validProps1.results[18].objectPath).toBe('b.b.b[3].b')
      expect(validProps1.results[19].objectPath).toBe('b.b.b[3].c')
      expect(validProps1.results[20].objectPath).toBe('b.b.b[4].a')
      expect(validProps1.results[21].objectPath).toBe('b.b.b[4].b')
      expect(validProps1.results[22].objectPath).toBe('b.b.b[4].c')
    })
  })
  describe(`PropTypes`, () => {
    it(`${prefix}.string`, () => {
      const valid1 = validateProps({ val: PropTypes.string }, { val: 'hello' })
      const valid2 = validateProps({ val: PropTypes.string }, { val: null })

      const invalid1 = validateProps({ val: PropTypes.string }, { val: 5 })
      const invalid2 = validateProps({ val: PropTypes.string.isRequired }, { val: null })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['string', 'null']))
      expect(valid2.results[0]).toMatchObject(validResult('val', ['string', 'null']))

      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid2).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['string', 'null'], { message: `Property 'val' should be type 'string | null', but type 'number' was found` }))
      expect(invalid2.results[0]).toMatchObject(invalidResult('val', ['string'], { message: `Property 'val' should be type 'string', but type 'null' was found` }))
    })
    it(`${prefix}.number`, () => {
      const valid1 = validateProps({ val: PropTypes.number }, { val: 5.5 })
      const valid2 = validateProps({ val: PropTypes.number }, { val: 6 })
      const valid3 = validateProps({ val: PropTypes.number }, { val: -5 })
      
      const invalid1 = validateProps({ val: PropTypes.number }, { val: 'a' })
      const invalid2 = validateProps({ val: PropTypes.number }, { val: [] })
      const invalid3 = validateProps({ val: PropTypes.number }, { val: {} })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid3).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['number', 'null']))
      expect(valid2.results[0]).toMatchObject(validResult('val', ['number', 'null']))
      expect(valid3.results[0]).toMatchObject(validResult('val', ['number', 'null']))

      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid2).toMatchObject(invalidTypeCheck())
      expect(invalid3).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['number', 'null'], { message: `Property 'val' should be type 'number | null', but type 'string' was found` }))
      expect(invalid2.results[0]).toMatchObject(invalidResult('val', ['number', 'null'], { message: `Property 'val' should be type 'number | null', but type 'Array' was found` }))
      expect(invalid3.results[0]).toMatchObject(invalidResult('val', ['number', 'null'], { message: `Property 'val' should be type 'number | null', but type 'Object' was found` }))
    })
    it(`${prefix}.integer`, () => {
      const valid1 = validateProps({ val: PropTypes.integer }, { val: 2 })
      const valid2 = validateProps({ val: PropTypes.integer }, { val: 6 })

      const invalid1 = validateProps({ val: PropTypes.integer }, { val: 2.5 })
      const invalid2 = validateProps({ val: PropTypes.integer }, { val: 'a' })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['number: integer', 'null']))
      expect(valid2.results[0]).toMatchObject(validResult('val', ['number: integer', 'null']))

      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid2).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['number: integer', 'null'], { message: `Property 'val' should be type 'number: integer | null'` }))
      expect(invalid2.results[0]).toMatchObject(invalidResult('val', ['number: integer', 'null'], { message: `Property 'val' should be type 'number: integer | null', but type 'string' was found` }))
    })
    it(`${prefix}.boolean`, () => {
      const valid1 = validateProps({ val: PropTypes.boolean }, { val: true })
      const valid2 = validateProps({ val: PropTypes.boolean }, { val: false })
      const valid3 = validateProps({ val: PropTypes.bool }, { val: true })
      const valid4 = validateProps({ val: PropTypes.bool }, { val: false })
      const valid5 = validateProps({ val: PropTypes.bool }, { val: null })
      const valid6 = validateProps({ val: PropTypes.bool.isRequired }, { val: false })

      const invalid1 = validateProps({ val: PropTypes.boolean }, { val: 2.5 })
      const invalid2 = validateProps({ val: PropTypes.boolean }, { val: 'a' })
      const invalid3 = validateProps({ val: PropTypes.boolean.isRequired }, { val: null })
      const invalid4 = validateProps({ val: PropTypes.bool.isRequired }, { val: null })
      const invalid5 = validateProps({ val: PropTypes.bool }, { val: undefined })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid3).toMatchObject(valid1)
      expect(valid4).toMatchObject(valid2)
      expect(valid5).toMatchObject(validTypeCheck())
      expect(valid6).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['boolean', 'null']))
      expect(valid2.results[0]).toMatchObject(validResult('val', ['boolean', 'null']))
      expect(valid3.results[0]).toMatchObject(validResult('val', ['boolean', 'null']))
      expect(valid4.results[0]).toMatchObject(validResult('val', ['boolean', 'null']))
      expect(valid5.results[0]).toMatchObject(validResult('val', ['boolean', 'null']))
      expect(valid6.results[0]).toMatchObject(validResult('val', ['boolean']))

      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid2).toMatchObject(invalidTypeCheck())
      expect(invalid3).toMatchObject(invalidTypeCheck())
      expect(invalid4).toMatchObject(invalidTypeCheck())
      expect(invalid5).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['boolean', 'null'], { message: `Property 'val' should be type 'boolean | null', but type 'number' was found` }))
      expect(invalid2.results[0]).toMatchObject(invalidResult('val', ['boolean', 'null'], { message: `Property 'val' should be type 'boolean | null', but type 'string' was found` }))
      expect(invalid3.results[0]).toMatchObject(invalidResult('val', ['boolean'], { message: `Property 'val' should be type 'boolean', but type 'null' was found` }))
      expect(invalid4.results[0]).toMatchObject(invalidResult('val', ['boolean'], { message: `Property 'val' should be type 'boolean', but type 'null' was found` }))
      expect(invalid5.results[0]).toMatchObject(invalidResult('val', ['boolean', 'null'], { message: `Property 'val' should be type 'boolean | null', but type 'undefined' was found` }))
    })
    it(`${prefix}.function`, () => {
      const testFn = () => console.log('hi')
      const valid1 = validateProps({ val: PropTypes.function }, { val: testFn })
      const valid2 = validateProps({ val: PropTypes.function }, { val: function something() { console.log('hi'); } })
      const valid3 = validateProps({ val: PropTypes.function }, { val: function () { console.log('hi'); } })
      const valid4 = validateProps({ val: PropTypes.function }, { val: async () => { console.log('hi'); } })
      const valid5 = validateProps({ val: PropTypes.function }, { val: async function () { console.log('hi'); } })
      const valid6 = validateProps({ val: PropTypes.func }, { val: testFn })
      const valid7 = validateProps({ val: PropTypes.func.isRequired }, { val: testFn })

      const invalid1 = validateProps({ val: PropTypes.function }, { val: [] })
      const invalid2 = validateProps({ val: PropTypes.function }, { val: 'a' })
      const invalid3 = validateProps({ val: PropTypes.function.isRequired }, { val: null })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid3).toMatchObject(validTypeCheck())
      expect(valid4).toMatchObject(validTypeCheck())
      expect(valid5).toMatchObject(validTypeCheck())
      expect(valid6).toMatchObject(valid1)
      expect(valid6).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['function', 'null']))
      expect(valid2.results[0]).toMatchObject(validResult('val', ['function', 'null']))
      expect(valid3.results[0]).toMatchObject(validResult('val', ['function', 'null']))
      expect(valid4.results[0]).toMatchObject(validResult('val', ['function', 'null']))
      expect(valid5.results[0]).toMatchObject(validResult('val', ['function', 'null']))
      expect(valid6.results[0]).toMatchObject(validResult('val', ['function', 'null']))
      expect(valid7.results[0]).toMatchObject(validResult('val', ['function']))
      
      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid2).toMatchObject(invalidTypeCheck())
      expect(invalid3).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['function', 'null'], { message: `Property 'val' should be type 'function | null', but type 'Array' was found` }))
      expect(invalid2.results[0]).toMatchObject(invalidResult('val', ['function', 'null'], { message: `Property 'val' should be type 'function | null', but type 'string' was found` }))
      expect(invalid3.results[0]).toMatchObject(invalidResult('val', ['function'], { message: `Property 'val' should be type 'function', but type 'null' was found` }))
    })
    it(`${prefix}.object`, () => {
      const valid1 = validateProps({ val: PropTypes.object }, { val: {} })
      const valid2 = validateProps({ val: PropTypes.object }, { val: { a: 'b' } })
      const valid3 = validateProps({ val: PropTypes.object.isRequired }, { val: new Object() })

      const invalid1 = validateProps({ val: PropTypes.object }, { val: [] })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid3).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['Object<any>', 'null']))
      expect(valid2.results[0]).toMatchObject(validResult('val', ['Object<any>', 'null']))
      expect(valid3.results[0]).toMatchObject(validResult('val', ['Object<any>']))
      
      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['Object<any>', 'null'], { message: `Property 'val' should be type 'Object<any> | null', but type 'Array' was found` }))
    })
    it(`${prefix}.array`, () => {
      const valid1 = validateProps({ val: PropTypes.array }, { val: ['a', 'b'] })
      const valid2 = validateProps({ val: PropTypes.array.isRequired }, { val: new Array() })

      const invalid1 = validateProps({ val: PropTypes.array }, { val: 5.5 })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['Array<any>', 'null']))
      expect(valid2.results[0]).toMatchObject(validResult('val', ['Array<any>']))
      
      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['Array<any>', 'null'], { message: `Property 'val' should be type 'Array<any> | null', but type 'number' was found` }))
    })
    it(`${prefix}.symbol`, () => {
      const valid1 = validateProps({ val: PropTypes.symbol.isRequired }, { val: Symbol('a') })

      const invalid1 = validateProps({ val: PropTypes.symbol.isRequired }, { val: 5.5 })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['symbol']))
      
      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['symbol'], { message: `Property 'val' should be type 'symbol', but type 'number' was found` }))
    })
    it(`${prefix}.regex`, () => {
      const valid1 = validateProps({ val: PropTypes.regex.isRequired }, { val: /a|b/ })
      const valid2 = validateProps({ val: PropTypes.regex.isRequired }, { val: /((.+?)[0-9]{2})/g })
      const valid3 = validateProps({ val: PropTypes.regex.isRequired }, { val: new RegExp('^([0-9]|b|c)+$', 'i') })

      const invalid1 = validateProps({ val: PropTypes.regex.isRequired }, { val: 5.5 })

      expect(valid1).toMatchObject(validTypeCheck())
      expect(valid1.results[0]).toMatchObject(validResult('val', ['RegExp']))
      expect(valid2).toMatchObject(validTypeCheck())
      expect(valid2.results[0]).toMatchObject(validResult('val', ['RegExp']))
      expect(valid3).toMatchObject(validTypeCheck())
      expect(valid3.results[0]).toMatchObject(validResult('val', ['RegExp']))
      
      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['RegExp'], { message: `Property 'val' should be type 'RegExp', but type 'number' was found` }))
    })
    it(`${prefix}.error`, () => {
      class MyError extends Error {
        constructor(args) {
          super(args)
          this.code = 'hello world'
        }
      }

      const getError = fn => {
        try {
          return fn()
        }
        catch (err) {
          return err
        }
      }

      const valid = [
        validateProps({ val: PropTypes.error.isRequired }, { val: new Error('test') }),
        validateProps({ val: PropTypes.error.isRequired }, { val: new TypeError('test') }),
        validateProps({ val: PropTypes.error.isRequired }, { val: new ReferenceError('test') }),
        validateProps({ val: PropTypes.error.isRequired }, { val: new SyntaxError('test') }),
        validateProps({ val: PropTypes.error.isRequired }, { val: new TypeError('test') }),
        validateProps({ val: PropTypes.error.isRequired }, { val: new URIError('test') }),
        validateProps({ val: PropTypes.error.isRequired }, { val: new MyError('test') }),
        validateProps({ val: PropTypes.error.isRequired }, { val: getError(() => { a() }) })
      ]

      const invalid = [
        validateProps({ val: PropTypes.error.isRequired }, { val: 5.5 }),
        validateProps({ val: PropTypes.error.isRequired }, { val: getError(() => { 1 + 1; }) })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(invalid[0].results[0]).toMatchObject(invalidResult('val', ['Error'], { message: `Property 'val' should be type 'Error', but type 'number' was found` }))
    })
    it(`${prefix}.any`, () => {
      const valid = [
        validateProps({ val: PropTypes.any }, { val: 'a' }),
        validateProps({ val: PropTypes.any }, { val: 2 }),
        validateProps({ val: PropTypes.any }, { val: [] }),
        validateProps({ val: PropTypes.any }, { val: {} }),
        validateProps({ val: PropTypes.any }, { val: Symbol('a') }),
        validateProps({ val: PropTypes.any }, { val: /[a-z]/ }),
        validateProps({ val: PropTypes.any }, { val: () => { console.log('a'); } }),
        validateProps({ val: PropTypes.any }, { val: null }),
        validateProps({ val: PropTypes.any }, { val: undefined })
      ]

      const invalid1 = validateProps({ val: PropTypes.any.isRequired }, { val: undefined })

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
        expect(validItem.results[0]).toMatchObject(validResult('val', ['any']))
      }
      
      expect(invalid1).toMatchObject(invalidTypeCheck())
      expect(invalid1.results[0]).toMatchObject(invalidResult('val', ['any'], { message: `Property 'val' should be type 'any', but type 'undefined' was found` }))
    })
    it(`${prefix}.numberRange`, () => {
      const valid = [
        validateProps({ val: PropTypes.numberRange(0, 5) }, { val: 3.5 }),
        validateProps({ val: PropTypes.numberRange.inclusive(0, 5) }, { val: 3.5 }),
        validateProps({ val: PropTypes.numberRange.inclusive(0, 5) }, { val: 5 }),
        validateProps({ val: PropTypes.numberRange.exclusive(0, 5) }, { val: 4.5 }),
        validateProps({ val: PropTypes.numberRange.greaterThan(0) }, { val: 2.5 }),
        validateProps({ val: PropTypes.numberRange.greaterThanOrEqual(0) }, { val: 0 }),
        validateProps({ val: PropTypes.numberRange.lessThan(0) }, { val: -4.5 }),
        validateProps({ val: PropTypes.numberRange.lessThanOrEqual(0) }, { val: 0 })
      ]

      const invalid = [
        validateProps({ val: PropTypes.numberRange(0, 5) }, { val: -5 }),
        validateProps({ val: PropTypes.numberRange.inclusive(0, 5) }, { val: -5 }),
        validateProps({ val: PropTypes.numberRange.exclusive(0, 5) }, { val: 9 }),
        validateProps({ val: PropTypes.numberRange.exclusive(0, 5) }, { val: 5 }),
        validateProps({ val: PropTypes.numberRange.greaterThan(0) }, { val: -2.5 }),
        validateProps({ val: PropTypes.numberRange.greaterThan(0) }, { val: 0 }),
        validateProps({ val: PropTypes.numberRange.greaterThanOrEqual(0) }, { val: -5 }),
        validateProps({ val: PropTypes.numberRange.lessThan(0) }, { val: 4.5 }),
        validateProps({ val: PropTypes.numberRange.lessThan(0) }, { val: 0 }),
        validateProps({ val: PropTypes.numberRange.lessThanOrEqual(0) }, { val: 2 })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.numberRange(0) }, { val: 3.5 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.numberRange.inclusive(0) }, { val: 3.5 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.numberRange.exclusive(0) }, { val: 3.5 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.numberRange.greaterThan(0, 1) }, { val: 3.5 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.numberRange.greaterThanOrEqual(0, 1) }, { val: 3.5 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.numberRange.lessThan(0, 1) }, { val: 3.5 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.numberRange.lessThanOrEqual(0, 1) }, { val: 3.5 })).toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.integerRange`, () => {
      const valid = [
        validateProps({ val: PropTypes.integerRange(0, 5) }, { val: 3 }),
        validateProps({ val: PropTypes.integerRange.inclusive(0, 5) }, { val: 3 }),
        validateProps({ val: PropTypes.integerRange.inclusive(0, 5) }, { val: 5 }),
        validateProps({ val: PropTypes.integerRange.exclusive(0, 5) }, { val: 4 }),
        validateProps({ val: PropTypes.integerRange.greaterThan(0) }, { val: 2 }),
        validateProps({ val: PropTypes.integerRange.greaterThanOrEqual(0) }, { val: 0 }),
        validateProps({ val: PropTypes.integerRange.lessThan(0) }, { val: -4 }),
        validateProps({ val: PropTypes.integerRange.lessThanOrEqual(0) }, { val: 0 })
      ]

      const validRangeButNonIntegers = [
        validateProps({ val: PropTypes.integerRange(0, 5) }, { val: 3.5 }),
        validateProps({ val: PropTypes.integerRange.inclusive(0, 5) }, { val: 3.5 }),
        validateProps({ val: PropTypes.integerRange.inclusive(0, 5) }, { val: 4.5 }),
        validateProps({ val: PropTypes.integerRange.exclusive(0, 5) }, { val: 4.5 }),
        validateProps({ val: PropTypes.integerRange.greaterThan(0) }, { val: 2.5 }),
        validateProps({ val: PropTypes.integerRange.greaterThanOrEqual(0) }, { val: 0.5 }),
        validateProps({ val: PropTypes.integerRange.lessThan(0) }, { val: -4.5 }),
        validateProps({ val: PropTypes.integerRange.lessThanOrEqual(0) }, { val: -0.5 })
      ]

      const invalid = [
        validateProps({ val: PropTypes.integerRange(0, 5) }, { val: -5 }),
        validateProps({ val: PropTypes.integerRange.inclusive(0, 5) }, { val: -5 }),
        validateProps({ val: PropTypes.integerRange.exclusive(0, 5) }, { val: 9 }),
        validateProps({ val: PropTypes.integerRange.exclusive(0, 5) }, { val: 5 }),
        validateProps({ val: PropTypes.integerRange.greaterThan(0) }, { val: -2 }),
        validateProps({ val: PropTypes.integerRange.greaterThan(0) }, { val: 0 }),
        validateProps({ val: PropTypes.integerRange.greaterThanOrEqual(0) }, { val: -5 }),
        validateProps({ val: PropTypes.integerRange.lessThan(0) }, { val: 4 }),
        validateProps({ val: PropTypes.integerRange.lessThan(0) }, { val: 0 }),
        validateProps({ val: PropTypes.integerRange.lessThanOrEqual(0) }, { val: 2 })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of [...invalid, ...validRangeButNonIntegers]) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.integerRange(0) }, { val: 3 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.integerRange.inclusive(0) }, { val: 3 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.integerRange.exclusive(0) }, { val: 3 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.integerRange.greaterThan(0, 1) }, { val: 3 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.integerRange.greaterThanOrEqual(0, 1) }, { val: 3 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.integerRange.lessThan(0, 1) }, { val: 3 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.integerRange.lessThanOrEqual(0, 1) }, { val: 3 })).toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.stringMatching`, () => {
      const valid = [
        validateProps({ val: PropTypes.stringMatching(/a|b/) }, { val: 'a' }),
        validateProps({ val: PropTypes.stringMatching(/a|b/) }, { val: 'b' }),
        validateProps({ val: PropTypes.stringMatching(/a|b/g) }, { val: 'b' }),
        validateProps({ val: PropTypes.stringMatching(/a|b/) }, { val: 'abc' }),
        validateProps({ val: PropTypes.stringMatching(/a|b/) }, { val: 'cbbc' }),
        validateProps({ val: PropTypes.stringMatching(/a|b/g) }, { val: 'cbbc' }),
        validateProps({ val: PropTypes.stringMatching(/^a$/) }, { val: 'a' }),
        validateProps({ val: PropTypes.stringMatching(/^a$/g) }, { val: 'a' })
      ]

      const invalid = [
        validateProps({ val: PropTypes.stringMatching(/a|b/) }, { val: 'x' }),
        validateProps({ val: PropTypes.stringMatching(/a|b/g) }, { val: 'x' }),
        validateProps({ val: PropTypes.stringMatching(/^a$/) }, { val: ' a ' }),
        validateProps({ val: PropTypes.stringMatching(/^a$/g) }, { val: ' a ' }),
        validateProps({ val: PropTypes.stringMatching(/^a$/g) }, { val: 2 })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.stringMatching(2) }, { val: 'a' })).toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.oneOf`, () => {
      const valid = [
        validateProps({ val: PropTypes.oneOf(['a', 'b']) }, { val: 'a' }),
        validateProps({ val: PropTypes.oneOf(['a', 'b']) }, { val: 'b' }),
        validateProps({ val: PropTypes.oneOf(['a', 'b']) }, { val: 'b' }),
        validateProps({ val: PropTypes.oneOf(['a', 4]) }, { val: 4 })
      ]

      const invalid = [
        validateProps({ val: PropTypes.oneOf(['a', 'b']) }, { val: 'c' }),
        validateProps({ val: PropTypes.oneOf(['a', 'b']) }, { val: [] }),
        validateProps({ val: PropTypes.oneOf([PropTypes.string, PropTypes.number]) }, { val: 5 })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.oneOf('a') }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.oneOf(['a', 'b']) }, { val: 'b' })).not.toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.oneOfType`, () => {
      const valid = [
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }, { val: 'a' }),
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }, { val: 5 }),
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.array]) }, { val: [] }),
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]) }, { val: ['a'] }),
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string))]) }, { val: { a: ['a'] } })
      ]

      const invalid = [
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }, { val: /a|b/ }),
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }, { val: [] }),
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.array]) }, { val: {} }),
        validateProps({ val: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]) }, { val: [5] })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.oneOfType('a') }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.oneOfType(['a', 'b']) }, { val: 'b' })).not.toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.arrayOf`, () => {
      const valid = [
        validateProps({ val: PropTypes.arrayOf(PropTypes.string) }, { val: ['a', 'b'] }),
        validateProps({ val: PropTypes.arrayOf(PropTypes.number) }, { val: [5, 6] }),
        validateProps({ val: PropTypes.arrayOf(PropTypes.shape({ a: PropTypes.string, b: PropTypes.number })) }, { val: [{ a: 'a', b: 2 }, { a: 'aaa', b: 222 }] }),
        validateProps({ val: PropTypes.arrayOf(PropTypes.oneOf(['a', 'b'])) }, { val: ['a', 'a', 'a', 'b', 'b'] }),
        validateProps({ val: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.number)])) }, { val: ['a', 'b', [1, 2, 3], 'c', 'd'] })
      ]

      const invalid = [
        validateProps({ val: PropTypes.arrayOf(PropTypes.string) }, { val: [1] }),
        validateProps({ val: PropTypes.arrayOf(PropTypes.number) }, { val: ['5'] }),
        //validateProps({ val: PropTypes.arrayOf(PropTypes.shape({ a: PropTypes.string, b: PropTypes.number })) }, { val: [{ a: 4, b: 'a' }, { a: 3, b: 'a' }] }),
        validateProps({ val: PropTypes.arrayOf(PropTypes.oneOf(['a', 'b'])) }, { val: ['a', 'a', 'a', 'b', 'c'] }),
        validateProps({ val: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.number)])) }, { val: [5, 'b', ['a', 2, 3], 'c', 'd'] })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.arrayOf() }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.objectOf`, () => {
      const valid = [
        validateProps({ val: PropTypes.objectOf(PropTypes.string) }, { val: { x: 'a', y: 'b' } }),
        validateProps({ val: PropTypes.objectOf(PropTypes.number) }, { val: { a: 1, b: 2 } }),
        validateProps({ val: PropTypes.objectOf(PropTypes.shape({ a: PropTypes.string, b: PropTypes.number })) }, { val: { a: { a: 'a', b: 5 } } }),
        validateProps({ val: PropTypes.objectOf(PropTypes.oneOf(['a', 'b'])) }, { val: { a: 'a', b: 'b', c: 'b', d: 'b', e: 'a', f: 'a' } }),
        validateProps({ val: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.number)])) }, { val: { a: 'a', b: 'b', c: 'c', d: [1, 2, 3], e: 'a' } })
      ]

      const invalid = [
        validateProps({ val: PropTypes.objectOf(PropTypes.string) }, { val: { a: 4 } }),
        validateProps({ val: PropTypes.objectOf(PropTypes.number) }, { val: { a: 'a' } }),
        //validateProps({ val: PropTypes.objectOf(PropTypes.shape({ a: PropTypes.string, b: PropTypes.number })) }, { val: { a: { a: 'a', b: 'b' } } }),
        validateProps({ val: PropTypes.objectOf(PropTypes.oneOf(['a', 'b'])) }, { val: { a: 'a', b: 'b', c: 'c' } }),
        validateProps({ val: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.number)])) }, { val: { a: 'a', b: [3, 4, 'a'], c: 3 } })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.arrayOf() }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.instanceOf`, () => {
      const valid = [
        validateProps({ val: PropTypes.instanceOf(TestClassA) }, { val: new TestClassA() }),
        validateProps({ val: PropTypes.instanceOf(TestClassBase) }, { val: new TestClassBase() }),
        validateProps({ val: PropTypes.instanceOf(TestClassBase) }, { val: new TestClassA() })
      ]

      const invalid = [
        validateProps({ val: PropTypes.instanceOf(TestClassA) }, { val: 'a' }),
        validateProps({ val: PropTypes.instanceOf(TestClassBase) }, { val: 'b' }),
        validateProps({ val: PropTypes.instanceOf(TestClassBase) }, { val: 'c' })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      function testFunction() {
        return true
      }

      expect(() => validateProps({ val: PropTypes.instanceOf('a') }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.instanceOf(() => {}) }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.instanceOf(new testFunction()) }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.shape`, () => {
      const valid = [
        validateProps({ val: PropTypes.shape({ a: PropTypes.string }) }, { val: { a: 'a' } }),
        validateProps({ val: PropTypes.shape({ a: PropTypes.string }) }, { val: { a: 'a', b: [] } }),
        validateProps({ val: PropTypes.shape({ a: PropTypes.string, b: PropTypes.string }) }, { val: { a: 'a', b: null } }),
        validateProps({ val: PropTypes.shape({ a: PropTypes.string, b: PropTypes.number }) }, { val: { a: 'a', b: 3 } }),
        validateProps({ val: PropTypes.shape({ a: PropTypes.string, b: PropTypes.shape({ a: PropTypes.array }) }) }, { val: { a: 'a', b: { a: [] } } }),
        validateProps({ val: PropTypes.shape({ a: PropTypes.string, b: PropTypes.shape({ a: PropTypes.instanceOf(TestClassBase)}) }) }, { val: { a: 'a', b: { a: new TestClassBase() } } })
      ]

      const invalid = [
        validateProps({ val: PropTypes.shape({ a: PropTypes.string }) }, { val: { a: 4 } }),
        validateProps({ val: PropTypes.shape({ a: PropTypes.number }) }, { val: { a: 'a' } }),
        validateProps({ val: PropTypes.shape({ a: PropTypes.number.isRequired }) }, { val: { a: null } })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.shape(PropTypes.number) }, { val: 45 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.shape(PropTypes.string) }, { val: 'b' })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.shape([PropTypes.string]) }, { val: ['a'] })).toThrow(PropTypesValidatorErrorBase)
    })
    it(`${prefix}.customProp`, () => {
      const valid = [
        validateProps({ val: PropTypes.customProp(() => true, 'anything') }, { val: 'anything' }),
        validateProps({ val: PropTypes.customProp(value => value === 'anything' || value > 5, 'anything') }, { val: 8 }),
        validateProps({ val: PropTypes.customProp(value => value === 'anything' || value > 5, 'anything') }, { val: 'anything' }),
        validateProps({ val: PropTypes.customProp((value, key) => key === 'val' && true, 'anything') }, { val: 'anything' })
      ]

      const invalid = [
        validateProps({ val: PropTypes.customProp(() => false, 'nothing') }, { val: 'anything' }),
        validateProps({ val: PropTypes.customProp(value => value > 5, 'something') }, { val: 4 })
      ]

      for (const validItem of valid) {
        expect(validItem).toMatchObject(validTypeCheck())
      }
      for (const invalidItem of invalid) {
        expect(invalidItem).toMatchObject(invalidTypeCheck())
      }

      expect(() => validateProps({ val: PropTypes.customProp(5) }, { val: 45 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.customProp(() => true, 5) }, { val: 45 })).toThrow(PropTypesValidatorErrorBase)
      expect(() => validateProps({ val: PropTypes.customProp(() => true, '') }, { val: 45 })).toThrow(PropTypesValidatorErrorBase)
    })
  })
})
