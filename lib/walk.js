// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { isDefined, isNotDefined } = require('./validator')

/**
 * Recursively walks through all given PropTypes and runs all validation results.
 */
const walkProps = (propTypes, propsObject, globalStrictCheck, localStrictCheck, objectParent = []) => {
  // Strict checking is either requested from the start by validateProps()
  // or it's set temporarily by a PropTypes validator's .isRequired member.
  const strictCheck = globalStrictCheck || localStrictCheck
  const state = { objectParent, strictCheck }

  const results = []

  // Run each validator.
  for (const [key, validator] of Object.entries(propTypes)) {
    const value = propsObject[key]

    // If we're doing a strict check, and the value is undefined, pass on an error.
    if (strictCheck && value === undefined) {
      results.push(isNotDefined(value, key, propsObject, state, { valueShouldBeDefined: true, valueExpectedTypes: validator.expectedTypes }))
      continue
    }

    // If the value is defined, check if it validates.
    const res = validator(value, key, propsObject, state)
    results.push(res)

    // Run any nested types that may be part of a .shape() or .exact() validator.
    if (validator.nestedPropTypes && value) {
      results.push(...walkProps(validator.nestedPropTypes, value, globalStrictCheck, validator.nestedIsStrict, [...objectParent, key]))
    }
  }

  // If we're doing a strict check, we also don't allow any values that don't have a validator
  // associated with them; that is, superfluous values. Pass on an error if there are any.
  if (strictCheck) {
    for (const [key, value] of Object.entries(propsObject)) {
      if (propTypes[key] !== undefined) {
        continue
      }
      results.push(isDefined(value, key, propsObject, state, { valueShouldNotBeDefined: true }))
    }
  }

  return results
}

module.exports = {
  walkProps
}
