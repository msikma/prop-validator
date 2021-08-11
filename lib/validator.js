// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { getObjectType, wrapInArray, unpackExpectedTypes } = require('./util')

/**
 * Returns the expected types for the current validation function.
 * 
 * If an intermediary checker is used (isDefined or isNotDefined) because we're doing a strict check,
 * the types of the original validator are passed on instead.
 */
const collectExpectedTypes = (validatorTypes = [], parentTypes = [], isRequired = false) => {
  const types = []
  types.push(...(parentTypes.length ? parentTypes : validatorTypes))
  if (!isRequired) types.push('null')
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
    const valueExpectedTypeList = collectExpectedTypes(validatorExpectedTypes, parentInfo.valueExpectedTypeList, isRequired)
    const valueExpectedType = valueExpectedTypeList.join(' | ')
    
    let isValid = false
    let exception = null
  
    const valueType = getObjectType(value)
    const responseData = { isRequired, valueType, valueExpectedType, valueExpectedTypeList, objectPath, key, value, message: null }
  
    if (value == null && !(canBeNull && value === null)) {
      return {
        isValid: !isRequired,
        ...responseData,
        message: createMessage(!isRequired, valueType, valueExpectedType, objectPath, parentInfo),
        exception
      }
    }
  
    try {
      isValid = validatorFunction(value, key, object, state, parentInfo)
    }
    catch (error) {
      exception = error
    }
    
    return {
      isValid,
      ...responseData,
      message: createMessage(isValid, valueType, valueExpectedType, objectPath, parentInfo),
      exception
    }
  }
}

/**
 * Returns a string that can be used to more easily debug validation errors.
 */
const createMessage = (isValid, valueType, valueExpectedType, objectPath, parentInfo = {}) => {
  if (isValid) return null
  const path = objectPath.join('.')

  if (parentInfo.valueShouldNotBeDefined) {
    return `Property '${path}' should not be defined, but type '${valueType}' was found`
  }
  return `Property '${path}' should be type '${valueExpectedType}', but type '${valueType}' was found`
}

/**
 * Adds a more strict version of the validator to its '.isRequired' value, and saves the expected types to both.
 */
const addValidatorProperties = (validator, validatorRequired, expectedPropTypes) => {
  Object.defineProperty(validator, 'isRequired', { value: validatorRequired, enumerable: false })
  Object.defineProperty(validator, 'expectedPropTypes', { value: expectedPropTypes, enumerable: false })
  Object.defineProperty(validatorRequired, 'isRequired', { value: true, enumerable: false })
  Object.defineProperty(validatorRequired, 'expectedPropTypes', { value: expectedPropTypes, enumerable: false })
}

/**
 * Passes a validator function into the wrapper and creates an 'isRequired' member for it.
 */
const makeValidator = (validatorFunction, requiredType, canBeNull = false) => {
  const expectedTypes = wrapInArray(requiredType)
  const wrappedValidatorFunction = validatorWrapper(validatorFunction, expectedTypes, canBeNull)
  const validatorObject = wrappedValidatorFunction(false)
  const validatorObjectRequired = wrappedValidatorFunction(true)
  addValidatorProperties(validatorObject, validatorObjectRequired, expectedTypes)
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
