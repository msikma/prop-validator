// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const util = require('util')
const { validatorError } = require('./error')

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

/** Joins a path of object keys together (e.g. 'myObject.something[0][1].somethingElse[2]'). */
const joinObjectPath = path => {
  if (!isArray(path)) {
    throw validatorError(`joinObjectPath() takes an array; received: ${debugInvalidArguments(path)}`)
  }
  let pathString = path.map(item => isInteger(item) ? `[${item}]` : `.${item}`).join('')
  if (pathString.startsWith('.')) pathString = pathString.slice(1)
  return pathString
}

/** Used to tell the user they passed invalid arguments to a validator. */
const debugInvalidArguments = (...args) => {
  let val
  if (args.length === 0) val = null
  if (args.length === 1) val = args[0]
  if (args.length > 1) val = args
  
  return util.inspect(val, { colors: false, compact: Infinity, maxArrayLength: 10, depth: 4, showHidden: false, breakLength: Infinity })
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
 * Checks that a given range array is structured correctly.
 * 
 * The range array's content depends on the type of range we're checking.
 * 
 * There are 6 types of ranges:
 * 
 *     - inclusive
 *     - exclusive
 *     - greaterThan
 *     - greaterThanOrEqual
 *     - lessThan
 *     - lessThanOrEqual
 * 
 * The 'inclusive' and 'exclusive' options require two values to be given.
 */
const checkRange = (range, rangeType, validatorName) => {
  const functionName = `${validatorName ? `PropTypes.${validatorName}` : 'checkRange'}${validatorName && rangeType !== 'inclusive' ? `.${rangeType}` : ''}()`

  if (rangeType === 'inclusive' || rangeType === 'exclusive') {
    const tooShort = range.length < 2
    const wrongOrder = range[0] > range[1]
    if (tooShort || wrongOrder) {
      throw validatorError(`${functionName} arguments must be (min, max); received: ${debugInvalidArguments(range)}`)
    }
  }
  else if (rangeType === 'greaterThan' || rangeType === 'greaterThanOrEqual' || rangeType === 'lessThan' || rangeType === 'lessThanOrEqual') {
    const tooLong = range.length > 1
    if (tooLong) {
      throw validatorError(`${functionName} argument must be a single number; received: ${debugInvalidArguments(range)}`)
    }
  }
  else {
    throw validatorError(`${functionName} was called with an invalid range type: ${rangeType}`)
  }

  return true
}

/**
 * Checks whether a given number is within a certain range.
 */
const inRange = (range, rangeType, validatorName, number) => {
  checkRange(range, rangeType, validatorName)

  let inRangeLeft = true
  let inRangeRight = true

  if (rangeType === 'inclusive') {
    inRangeLeft = number >= range[0]
    inRangeRight = number <= range[1]
  }
  else if (rangeType === 'exclusive') {
    inRangeLeft = number > range[0]
    inRangeRight = number < range[1]
  }
  else if (rangeType === 'greaterThan') {
    inRangeLeft = number > range[0]
  }
  else if (rangeType === 'greaterThanOrEqual') {
    inRangeLeft = number >= range[0]
  }
  else if (rangeType === 'lessThan') {
    inRangeRight = number < range[0]
  }
  else if (rangeType === 'lessThanOrEqual') {
    inRangeRight = number <= range[0]
  }

  return inRangeLeft && inRangeRight
}

/**
 * Formats a range array to something human readable.
 */
const formatRange = (range, rangeType) => {
  checkRange(range, rangeType)

  const rangeChars = {
    inclusive: '≤',
    exclusive: '<',
    greaterThan: '>',
    greaterThanOrEqual: '≥',
    lessThan: '<',
    lessThanOrEqual: '≤'
  }
  const rangeChar = rangeChars[rangeType]

  return (range.length === 1 ? ['n', rangeChar, range[0]] : [range[0], rangeChar, 'n', rangeChar, range[1]]).join(' ')
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
  const objectPathList = wrapInArray(objectName || [])
  if (isPlainObject(propTypes) || objectName === false) {
    return [propTypes, propsObject, objectPathList]
  }
  else {
    const path = objectPathList.length ? objectPathList : ['<anonymous>']
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
  isClass,
  isSymbol,
  unpackExpectedTypes,
  inRange,
  formatRange,
  walkArray,
  wrapInArray,
  wrapProps,
  checkRange,
  joinObjectPath,
  debugInvalidArguments
}
