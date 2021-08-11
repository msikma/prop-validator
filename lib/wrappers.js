// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { validatorError } = require('./error')
const { makeValidator } = require('./validator')
const { isArray, unpackExpectedTypes } = require('./util')

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
    throw validatorError('PropTypes.oneOfType() only takes a single array of validator functions such as PropTypes.string, PropTypes.number, etc.')
  }
  const validatorFunctions = args[0]
  const validatorTypes = validatorFunctions.map(n => unpackExpectedTypes(n.expectedTypes)).flat()

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
      throw validatorError('PropTypes.oneOf() only takes a single array of literals that can be checked with Object.is()')
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
const makeMemberValidator = (containerValidator, getIterator) => {
  return memberValidator => {
    const containerTypes = unpackExpectedTypes(containerValidator.expectedTypes)
    const memberTypes = unpackExpectedTypes(memberValidator.expectedTypes)
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
    return memberValidatorObject
  }
}

/**
 * Creates a nested validator that can contain further PropTypes rules inside of it.
 * 
 * All this does is tag the validator as containing nested rules. The actual work of validating
 * nested objects is done in the walkProps() function.
 */
const makeNestedValidator = (validatorConstructor, isStrict) => {
  return propTypes => {
    const validatorObject = validatorConstructor()
    Object.defineProperty(validatorObject, 'nestedPropTypes', {
      value: propTypes,
      enumerable: false
    })
    Object.defineProperty(validatorObject, 'nestedIsStrict', {
      value: isStrict,
      enumerable: false
    })
    return validatorObject
  }
}

module.exports = {
  makeNestedValidator,
  makeEnumValidator,
  makeMemberValidator,
  makeTypeEnumValidator
}
