// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { PropTypesValidatorError } = require('./error')
const { makeValidator } = require('./validator')
const { isArray, unpackExpectedTypes, inRange, isRegExp, debugInvalidArguments } = require('./util')

/**
 * Ensures that only a single array of literals is passed to an enum validator.
 */
const validateEnumValues = passedArguments => {
  // Only take a single array.
  if (!passedArguments) return false
  if (passedArguments.length > 1) return false
  if (!isArray(passedArguments[0])) return false
  return true
}

/**
 * Creates an OR validator composed of several different PropTypes validators.
 * 
 * This validator checks whether a given value matches one of the given validators.
 * If any of them match, the check passes.
 */
const makeTypeEnumValidator = (...args) => {
  // Validate the options passed to the type enum. They can only be validator functions.
  if (!validateEnumValues(args)) {
    throw new PropTypesValidatorError('PropTypes.oneOfType() only takes a single array of validator functions such as PropTypes.string, PropTypes.number, etc.')
  }
  const validatorFunctions = args[0]
  const validatorTypes = validatorFunctions.map(n => unpackExpectedTypes(n.expectedPropTypes)).flat()

  const enumValidatorObject = makeValidator(
    (...validatorArgs) => {
      for (const validator of validatorFunctions) {
        const res = validator(...validatorArgs)
        if (res.isValid) return true
      }
      return false
    },
    validatorTypes
  )
  return enumValidatorObject
}

/**
 * Creates an OR validator that checks for any number of static values.
 * 
 * Checks whether a given value exactly matches any of a list of given acceptable values.
 */
const makeEnumValidator = validatorConstructor => {
  return (...args) => {
    // Validate the options passed to the enum. They can only be literal values.
    if (!validateEnumValues(args)) {
      throw new PropTypesValidatorError(`PropTypes.oneOf() only takes a single array of literals that can be checked with Object.is(); received ${debugInvalidArguments(args)}`)
    }
    const propTypes = args[0]
    const validatorObject = validatorConstructor(propTypes)
    return validatorObject
  }
}

/**
 * Creates a validator that checks the member values of an object or array for a given PropType validator.
 * 
 * This is used to check whether an array's members, or an object's values, are all valid according to
 * a given validator.
 */
const makeMemberValidator = (validatorType, containerValidator, getIterator) => {
  return memberValidator => {
    // Validate the options passed to the enum. They can only be literal values.
    if (isArray(memberValidator)) {
      throw new PropTypesValidatorError(`PropTypes.${validatorType}() only takes a single PropTypes argument, e.g. PropTypes.${validatorType}(PropTypes.string); received ${debugInvalidArguments(memberValidator)}`)
    }
    if (memberValidator == null) {
      throw new PropTypesValidatorError(`PropTypes.${validatorType}() requires a single PropTypes function as argument, e.g. PropTypes.${validatorType}(PropTypes.string); received ${debugInvalidArguments(memberValidator)}`)
    }
    const containerTypes = unpackExpectedTypes(containerValidator.expectedPropTypes)
    const memberTypes = unpackExpectedTypes(memberValidator.expectedPropTypes)
    const memberValidatorObject = makeValidator(
      (...validatorArgs) => {
        // Validate that the container is the correct type (array or object).
        const res = containerValidator(...validatorArgs)
        if (!res.isValid) return false

        // Check the members of the object passed by the user.
        const container = validatorArgs[0]
        for (const member of getIterator(container)) {
          const res = memberValidator(member, ...validatorArgs.slice(1))

          if (!res.isValid) return false
        }
        return true
      },
      containerTypes.map(containerType => `${containerType}<${memberTypes.join(' | ')}>`)
    )
    
    // Pass on any nested PropTypes from a PropTypes.shape() or PropTypes.exact().
    Object.defineProperty(memberValidatorObject, 'isExact', { value: memberValidator.isExact, enumerable: false })
    Object.defineProperty(memberValidatorObject, 'isMemberValidator', { value: true, enumerable: false })
    Object.defineProperty(memberValidatorObject, 'nestedPropTypes', { value: memberValidator.nestedPropTypes, enumerable: false })

    return memberValidatorObject
  }
}

/**
 * Adds a number of properties to a validator indicating its nested PropTypes.
 */
const addNestedValidatorProperties = (validator, nestedPropTypes, isExact) => {
  Object.defineProperty(validator, 'isExact', { value: isExact, enumerable: false })
  Object.defineProperty(validator, 'nestedPropTypes', { value: nestedPropTypes, enumerable: false })
  Object.defineProperty(validator.isRequired, 'isExact', { value: isExact, enumerable: false })
  Object.defineProperty(validator.isRequired, 'nestedPropTypes', { value: nestedPropTypes, enumerable: false })
}

/**
 * Creates a nested validator that can contain further PropTypes rules inside of it.
 * 
 * All this does is tag the validator as containing nested rules. The actual work of validating
 * nested objects is done in the walkProps() function.
 */
const makeNestedValidator = (validatorConstructor, isExact) => {
  return propTypes => {
    const validatorObject = validatorConstructor(propTypes)
    addNestedValidatorProperties(validatorObject, propTypes, isExact)
    return validatorObject
  }
}

/**
 * Wrapper for .regex() to make sure the given value is a regex.
 */
const makeRegexValidator = (regex) => {
  if (!isRegExp(regex)) {
    throw new PropTypesValidatorError(`PropTypes.stringMatching() only takes a single regular expression argument, e.g. PropTypes.stringMatching(/a|b/); received ${debugInvalidArguments(regex)}`)
  }
  return makeValidator(object => object.match(regex) != null, () => `string: ${regex}`)
}

/**
 * Creates a validator that has its arguments checked.
 * 
 * This is used for some of the function-based validators, like .instanceOf() etc.,
 * to make sure we throw in case the user passes in the wrong arguments.
 */
const makeCheckedValidator = (validator, checker, error) => {
  return (...args) => {
    if (!checker(...args)) {
      throw new PropTypesValidatorError(`${error}; received ${debugInvalidArguments(...args)}`)
    }
    return validator(...args)
  }
}

/**
 * Creates a validator that checks numbers for whether they are in a certain range.
 */
const makeRangeValidator = (baseValidator, typeFormatter, validatorName) => {
  /** Returns a validator that checks a particular type of number range. */
  const makeRangeValidator = (rangeType) => (...range) => makeValidator(
    object => baseValidator(object) && inRange(range, rangeType, validatorName, object),
    typeFormatter(range, rangeType)
  )

  const base = makeRangeValidator('inclusive')
  const exclusive = makeRangeValidator('exclusive')
  const greaterThan = makeRangeValidator('greaterThan')
  const greaterThanOrEqual = makeRangeValidator('greaterThanOrEqual')
  const lessThan = makeRangeValidator('lessThan')
  const lessThanOrEqual = makeRangeValidator('lessThanOrEqual')
  
  Object.defineProperty(base, 'inclusive', { value: base, enumerable: false })
  Object.defineProperty(base, 'exclusive', { value: exclusive, enumerable: false })
  Object.defineProperty(base, 'greaterThan', { value: greaterThan, enumerable: false })
  Object.defineProperty(base, 'greaterThanOrEqual', { value: greaterThanOrEqual, enumerable: false })
  Object.defineProperty(base, 'lessThan', { value: lessThan, enumerable: false })
  Object.defineProperty(base, 'lessThanOrEqual', { value: lessThanOrEqual, enumerable: false })

  return base
}

module.exports = {
  makeRegexValidator,
  makeNestedValidator,
  makeEnumValidator,
  makeMemberValidator,
  makeTypeEnumValidator,
  makeCheckedValidator,
  makeRangeValidator
}
