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

/** List of primitive types in Javascript. */
const primitiveTypes = ['String', 'Number', 'Boolean', 'Undefined', 'Null']

/** Returns an object's type (unwrapped from its "[object Typename]" brackets). */
const getObjectType = obj => {
  // Get the plain type of the object.
  const type = Object.prototype.toString.call(obj).match(/\[object ([^\]]+?)\]/)[1]
  if (primitiveTypes.includes(type)) {
    return type.toLowerCase()
  }

  // Return the class name if this is one.
  if (isClass(obj)) {
    return `${obj.name}`
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

/**
 * Normally we expect the user to pass two plain objects: one containing the PropTypes,
 * and another containing key/value pairs to check. This is after the original React PropTypes
 * design where all props are always passed as an object (attributes on a React component),
 * and there is no PropType checking of single values.
 * 
 * However, in our use case, single value checking might be useful:
 * 
 *   const res = validateProps(PropTypes.string, 2)
 * 
 * However, in that case the object that's being checked does not have a name, which we do need.
 * To get around that, we wrap plain values in a plain object, with the key named '<anonymous>'.
 * If the user doesn't want to see this in the output, 'false' can be passed to prevent it.
 * In that case the first item's key will be 'null'.
 * 
 * The user is able to also pass 'objectName' to validateProps(), used to clarify debugging text.
 * If they do, we use that for the key name instead.
 */
const wrapProps = (propTypes, propsObject, objectName) => {
  const objectPath = wrapInArray(objectName || [])
  if (isPlainObject(propTypes) || objectName === false) {
    return [propTypes, propsObject, objectPath]
  }
  else {
    const path = objectPath.length ? objectPath : ['<anonymous>']
    const key = path[path.length - 1]
    return [
      { [key]: propTypes },
      { [key]: propsObject },
      path.slice(0, -1)
    ]
  }
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
  wrapInArray,
  wrapProps
}
