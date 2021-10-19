// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { isArray, isFunction, isNumber, isInteger, isBoolean, isPlainObject, isString, isSymbol, isRegExp, isEqual, walkArray, getObjectType, formatRange, isClass, debugInvalidArguments, isError } = require('./util')
const { makeNestedValidator, makeEnumValidator, makeTypeEnumValidator, makeMemberValidator, makeRangeValidator, makeRegexValidator, makeCheckedValidator } = require('./wrappers')
const { makeValidator } = require('./validator')

/** Container for all PropTypes validator functions. */
const PropTypes = {}

/** PropTypes validator for the string type. */
PropTypes.string = makeValidator(object => isString(object), 'string')

/** PropTypes validator for integers. */
PropTypes.integer = makeValidator(object => isInteger(object), 'number: integer')

/** PropTypes validator for integers within a given range. */
PropTypes.integerRange = makeRangeValidator(
  object => isInteger(object),
  (range, rangeType) => `number: integer: ${formatRange(range, rangeType)}`,
  'integerRange'
)

/** PropTypes validator for the number type. */
PropTypes.number = makeValidator(object => isNumber(object), 'number')

/** PropTypes validator for numbers within a given range. */
PropTypes.numberRange = makeRangeValidator(
  object => isNumber(object),
  (range, rangeType) => `number: ${formatRange(range, rangeType)}`,
  'numberRange'
)

/** PropTypes validator for the boolean type. */
PropTypes.boolean = makeValidator(object => isBoolean(object), 'boolean')
PropTypes.bool = PropTypes.boolean

/** PropTypes validator for the function type. */
PropTypes.function = makeValidator(object => isFunction(object), 'function')
PropTypes.func = PropTypes.function

/** PropTypes validator for the object type. */
PropTypes.object = makeValidator(object => isPlainObject(object), 'Object<any>')

/** PropTypes validator for the symbol type. */
PropTypes.symbol = makeValidator(object => isSymbol(object), 'symbol')

/** PropTypes validator for the array type. */
PropTypes.array = makeValidator(object => isArray(object), 'Array<any>')

/** PropTypes validator for the RegExp type. */
PropTypes.regex = makeValidator(object => isRegExp(object), 'RegExp')

/** PropTypes validator for any type; always validates positively. */
PropTypes.any = makeValidator(() => true, 'any', false)

/** PropTypes validator for the Error type. */
PropTypes.error = makeValidator(object => isError(object), 'Error')

/** PropTypes validator for strings that match a specific regular expression. */
PropTypes.stringMatching = regex => makeRegexValidator(regex)

/** Enum type PropTypes validator that matches values against a number of literals. */
PropTypes.oneOf = makeEnumValidator(
  literals => makeValidator(
    object => walkArray(isEqual, literals, object),
    literals.map(l => `${getObjectType(l)}: ${debugInvalidArguments(l)}`)
  )
)

/** Enum type PropTypes validator that matches values against a number of other validators. */
PropTypes.oneOfType = validators => makeTypeEnumValidator(validators)

/** PropTypes validator for arrays containing only members of a specific type. */
PropTypes.arrayOf = makeMemberValidator(
  'arrayOf',
  makeValidator(object => isArray(object), 'Array'),
  object => object
)

/** PropTypes validator for objects containing only values of a specific type. */
PropTypes.objectOf = makeMemberValidator(
  'objectOf',
  makeValidator(object => isPlainObject(object), 'Object'),
  object => Object.values(object)
)

/** PropTypes validator for instances of a specific object or class. */
PropTypes.instanceOf = makeCheckedValidator(
  classObject => makeValidator(classInstance => classInstance instanceof classObject, getObjectType(classObject)),
  classObject => isClass(classObject),
  'PropTypes.instanceOf() takes a class object as argument'
)

/** PropTypes validator that lets the user provide a custom type and function. */
PropTypes.customProp = makeCheckedValidator(
  (func, type) => makeValidator(func, type),
  (func, type) => isFunction(func) && isString(type) && type.length > 0,
  'PropTypes.customProp() must be used with a function as first argument, and a string as second argument'
)

/** Nested PropTypes validator for objects. */
PropTypes.shape = makeNestedValidator(makeCheckedValidator(
  () => makeValidator(object => isPlainObject(object), 'Object'),
  object => isPlainObject(object),
  'PropTypes.shape() takes a plain object as argument'
), false)

/** Nested PropTypes validator for objects that cannot have unexpected entries. */
PropTypes.exact = makeNestedValidator(makeCheckedValidator(
  () => makeValidator(object => isPlainObject(object), 'Object'),
  object => isPlainObject(object),
  'PropTypes.exact() takes a plain object as argument'
), true)

module.exports = PropTypes
