// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { getObjectType, wrapInArray, unpackExpectedTypes, joinObjectPath } = require('./util')

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
    const objectPathList = [...(state.objectParent || []), key].filter(n => n !== null)
    const objectPath = joinObjectPath(objectPathList)
    const valueExpectedTypeList = collectExpectedTypes(validatorExpectedTypes, parentInfo.valueExpectedTypeList, isRequired)
    const valueExpectedType = valueExpectedTypeList.join(' | ')
    
    let isValid = false
    let exception = null
  
    const valueType = getObjectType(value)
    const responseData = { isRequired, valueType, valueExpectedType, valueExpectedTypeList, objectPath, objectPathList, key, value, message: null }
    const messageData = [valueType, valueExpectedType, valueExpectedTypeList, objectPath, objectPathList, parentInfo]
  
    if (value == null && !(canBeNull && value === null)) {
      return {
        isValid: !isRequired,
        ...responseData,
        message: createMessage(!isRequired, ...messageData),
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
      message: createMessage(isValid, ...messageData),
      exception
    }
  }
}



/**
 * Returns a string that can be used to more easily debug validation errors.
 */
const createMessage = (isValid, valueType, valueExpectedType, valueExpectedTypeList, objectPath, objectPathList, parentInfo = {}) => {
  if (isValid) return null

  // Check if any of the types have 'parent' types; e.g. for 'integer', this is 'number',
  // since the integer type is 'number: integer'. If the parent type matches the
  // expected type, don't display the latter half of the error message since it means
  // the type itself is correct, but the value isn't within the expected subset.
  const parentTypeList = valueExpectedTypeList.map(n => n.split(':')[0])
  const matchesParent = parentTypeList.includes(valueType)

  if (parentInfo.valueShouldNotBeDefined) {
    return `Property '${objectPath}' should not be defined, but type '${valueType}' was found`
  }
  return `Property '${objectPath}' should be type '${valueExpectedType}'${matchesParent ? `` : `, but type '${valueType}' was found`}`
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
