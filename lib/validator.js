// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { getObjectType, wrapInArray, unpackExpectedTypes } = require('./util')

/**
 * Returns the expected types for the current validation function.
 * 
 * If an intermediary checker is used (isDefined or isNotDefined) because we're doing a strict check,
 * the types of the original validator are passed on instead.
 */
const collectExpectedTypes = (validatorTypes = [], parentTypes = []) => {
  const types = []
  if (parentTypes.length) types.push(...parentTypes)
  else types.push(...validatorTypes)
  return types
}

/**
 * Wrapper function that takes a validator function, runs it, and returns the results
 * in a consistent format along with some metadata.
 * 
 * All validator functions are passed through here.
 */
const validatorWrapper = (validatorFunction, valueExpectedTypeObject, canBeNull) => {
  const validatorExpectedTypes = unpackExpectedTypes(valueExpectedTypeObject)
  return isRequired => (value, key, object, state, parentInfo = {}) => {
    const objectPath = [...(state.objectParent || []), key]
    const valueExpectedTypes = collectExpectedTypes(validatorExpectedTypes, parentInfo.valueExpectedTypes)
    
    let isValid = false
    let exception = null
  
    const valueType = getObjectType(value)
    const responseData = { isRequired, valueType, valueExpectedTypes, objectPath, key, value, message: null }
    const messageData = [isRequired, key, value, valueType, valueExpectedTypes, objectPath, parentInfo]
  
    if (value == null && !(canBeNull && value === null)) {
      return { isValid: !isRequired, ...responseData, message: createMessage(!isRequired, ...messageData), exception }
    }
  
    try {
      isValid = validatorFunction(value, key, object, state, parentInfo)
    }
    catch (error) {
      exception = error
    }
    
    return { isValid, ...responseData, message: createMessage(isValid, ...messageData), exception }
  }
}

/**
 * Returns a string that can be used to more easily debug validation errors,
 * or null if there was no validation error.
 */
const createMessage = (isValid, isRequired, key, value, valueType, valueExpectedTypes, objectPath, parentInfo = {}) => {
  if (isValid) return null
  const expectedTypes = wrapInArray(parentInfo.valueExpectedTypes || valueExpectedTypes)
  const path = objectPath.join('.')
  const gotString = `; got '${valueType}'`
  const gotValue = isRequired && value === undefined ? '; is missing' : gotString
  if (parentInfo.valueShouldNotBeDefined) {
    return `prop '${path}' must not be defined${gotValue}`
  }
  if (parentInfo.valueShouldBeDefined) {
    return `prop '${path}' must be defined${gotValue}`
  }
  return `prop '${path}' must be type ${expectedTypes.map(type => `'${type}'`).join(' or ')}${isRequired ? '' : ` or null`}${gotValue}`
}

/**
 * Passes a validator function into the wrapper and creates an 'isRequired' member for it.
 */
const makeValidator = (validatorFunction, requiredType, canBeNull = false) => {
  const expectedTypes = wrapInArray(requiredType)
  const wrappedValidatorFunction = validatorWrapper(validatorFunction, expectedTypes, canBeNull)
  const validatorObject = wrappedValidatorFunction(false)
  Object.defineProperty(validatorObject, 'expectedTypes', {
    value: expectedTypes,
    enumerable: false
  })
  Object.defineProperty(validatorObject, 'isRequired', {
    value: wrappedValidatorFunction(true),
    enumerable: false
  })
  return validatorObject
}

/** Validator helper function used to check if a variable is defined; used for strict checks. */
const isDefined = validatorWrapper(object => object === undefined)(true)

/** Validator helper function used to check if a variable is not defined; used for strict checks. */
const isNotDefined = validatorWrapper(object => object !== undefined)(true)

module.exports = {
  makeValidator,
  validatorWrapper,
  isDefined,
  isNotDefined
}
