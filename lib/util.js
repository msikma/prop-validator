// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

/** Wraps anything in an array if it isn't one already. */
const wrapInArray = obj => Array.isArray(obj) ? obj : [obj]

/** Returns true for objects (such as {} or new Object()), false otherwise. */
const isPlainObject = obj => obj != null && typeof obj === 'object' && obj.constructor === Object

/** Checks whether something is a string. */
const isString = obj => typeof obj === 'string' || obj instanceof String

/** Checks whether something is an integer. */
const isInteger = obj => Number.isInteger(obj)

/** Checks whether something is any type of number (excluding NaN). */
const isNumber = obj => !isNaN(obj) && Object.prototype.toString.call(obj) === '[object Number]'

/** Checks whether something is a function. */
const isFunction = obj => typeof obj === 'function'

/** Checks whether something is a boolean. */
const isBoolean = obj => obj === true || obj === false

/** Checks whether something is a Symbol. */
const isSymbol = obj => Object.prototype.toString.call(obj) === '[object Symbol]'

/** Checks whether something is a RegExp. */
const isRegExp = obj => Object.prototype.toString.call(obj) === '[object RegExp]'

/** Checks whether something is an array. */
const isArray = Array.isArray

/** Checks whether something is a class. */
const isClass = obj => isFunction(obj) && /^\s*class\s+/.test(obj.toString())

/** Returns an object's type (unwrapped from its "[object Typename]" brackets). */
const getObjectType = obj => {
  // Get the plain type of the object.
  const type = Object.prototype.toString.call(obj).match(/\[object ([^\]]+?)\]/)[1]

  // Return the class name if this is one.
  if (isClass(obj)) {
    return `class ${obj.name}`
  }

  // If this is a class instance, return the class name.
  if (obj?.constructor) {
    const name = obj.constructor.name
    if (name !== type) {
      return `${name}`
    }
  }

  return type
}

/** Checks whether two objects are equal to one another using Object.is(). */
const isEqual = (objA, objB) => Object.is(objA, objB)

/** Runs a true/false check on an array of values. */
const walkArray = (fn, values, obj) => {
  for (const value of values) {
    if (fn(value, obj)) {
      return true
    }
  }
  return false
}

/**
 * Returns an array expected types of an object; if any of the values is a function, it will be run and its result returned.
 */
const unpackExpectedTypes = arr => {
  const output = (arr || []).map(obj => {
    if (isFunction(obj)) return obj()
    return obj
  })
  return output.flat()
}

module.exports = {
  getObjectType,
  isArray,
  isBoolean,
  isEqual,
  isFunction,
  isInteger,
  isNumber,
  isPlainObject,
  isRegExp,
  isString,
  isSymbol,
  unpackExpectedTypes,
  walkArray,
  wrapInArray
}
