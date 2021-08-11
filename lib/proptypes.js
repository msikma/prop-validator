// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { isArray, isFunction, isNumber, isInteger, isBoolean, isPlainObject, isString, isSymbol, isRegExp, isEqual, walkArray, getObjectType } = require('./util')
const { makeNestedValidator, makeEnumValidator, makeTypeEnumValidator, makeMemberValidator } = require('./wrappers')
const { makeValidator } = require('./validator')

/** Container for all PropTypes validator functions. */
const PropTypes = {}

/** PropTypes validator for the String type. */
PropTypes.string = makeValidator(object => isString(object), 'string')

/** PropTypes validator for the Number type. */
PropTypes.integer = makeValidator(object => isInteger(object), 'number: integer')

/** PropTypes validator for Numbers that are integers. */
PropTypes.number = makeValidator(object => isNumber(object), 'number')

/** PropTypes validator for the Boolean type. */
PropTypes.boolean = makeValidator(object => isBoolean(object), 'boolean')
PropTypes.bool = PropTypes.boolean

/** PropTypes validator for the Function type. */
PropTypes.function = makeValidator(object => isFunction(object), 'function')
PropTypes.func = PropTypes.function

/** PropTypes validator for the Object type. */
PropTypes.object = makeValidator(object => isPlainObject(object), 'Object<any>')

/** PropTypes validator for the Symbol type. */
PropTypes.symbol = makeValidator(object => isSymbol(object), 'symbol')

/** PropTypes validator for the Array type. */
PropTypes.array = makeValidator(object => isArray(object), 'Array<any>')

/** PropTypes validator for the RegExp type. */
PropTypes.regex = makeValidator(object => isRegExp(object), 'RegExp')

/** PropTypes validator for any type; always validates positively. */
PropTypes.any = makeValidator(_ => true, 'any', true)

/** PropTypes validator for strings that need to match a specific regular expression. */
PropTypes.stringMatching = regex => makeValidator(object => object.match(regex) != null, () => `string: ${regex}`)

/** Enum type PropTypes validator that matches values against a number of literals. */
PropTypes.oneOf = makeEnumValidator(
  literals => makeValidator(
    object => walkArray(isEqual, literals, object),
    literals.map(l => `${getObjectType(l)}: ${JSON.stringify(l)}`)
  )
)

/** Enum type PropTypes validator that matches values against a number of other validators. */
PropTypes.oneOfType = validators => makeTypeEnumValidator(validators)

/** PropTypes validator for arrays containing only members of a specific type. */
PropTypes.arrayOf = makeMemberValidator(
  makeValidator(object => isArray(object), 'Array'),
  object => object
)

/** PropTypes validator for objects containing only values of a specific type. */
PropTypes.objectOf = makeMemberValidator(
  makeValidator(object => isPlainObject(object), 'Object'),
  object => Object.values(object)
)

/** PropTypes validator for instances of a specific object or class. */
PropTypes.instanceOf = classObject => makeValidator(classInstance => classInstance instanceof classObject, getObjectType(classObject))

/** PropTypes validator that lets the user provide a custom type and function. */
PropTypes.customProp = (func, type) => makeValidator(func, type)

/** Nested PropTypes validator for objects. */
PropTypes.shape = makeNestedValidator(() => makeValidator(object => isPlainObject(object), 'Object'), false)

/** Nested PropTypes validator that enforces strict validation. */
PropTypes.exact = makeNestedValidator(() => makeValidator(object => isPlainObject(object), 'Object'), true)

module.exports = PropTypes
