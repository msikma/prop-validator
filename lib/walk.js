// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { isDefined, isNotDefined } = require('./validator')
const { isFunction, isArray, isPlainObject, wrapInArray } = require('./util')

/**
 * Validates a single property; used by walkProps() to walk through the nodes.
 */
const validateSingleProp = (validator, value, key, propsObject, state, objectParent, objectNextKey = []) => {
  const results = []

  // If the value is defined, check if it validates.
  const res = validator(value, key, propsObject, state)
  results.push(res)

  // Run any nested types that may be part of a .shape() or .exact() validator.
  if (validator.nestedPropTypes && value) {
    // There are two special cases to consider: .arrayOf() and .objectOf().
    // When these have nested values, we need to run walkProps() on their keys.
    // To accommodate, we add the key (object key or array index) to the objectParent array.
    const values = validator.isMemberValidator ? Object.entries(value).map(nestedValue => [[nestedValue[0]], nestedValue[1]]) : [[[], value]]
    for (const nestedValue of values) {
      results.push(...walkProps(validator.nestedPropTypes, nestedValue[1], [...objectParent, ...wrapInArray(objectNextKey), ...nestedValue[0]], validator.isExact))
    }
  }

  return results
}

/**
 * Recursively walks through all given PropTypes and runs all validation results.
 */
const walkProps = (propTypes, propsObject, objectParent = [], isExact = false) => {
  const state = { objectParent, isExact }
  const results = []

  // It's possible to pass a single function as the validator.
  if (isFunction(propTypes)) {
    results.push(...validateSingleProp(propTypes, propsObject, null, propsObject, state, objectParent))
    return results
  }

  // Run each validator.
  for (const [key, validator] of Object.entries(propTypes)) {
    const value = propsObject[key]

    // Pass on an error for this item if it's required, but undefined.
    if (validator.isRequired === true && value === undefined) {
      results.push(isNotDefined(value, key, propsObject, state, { valueShouldBeDefined: true, valueExpectedTypeList: validator.expectedPropTypes }))
      continue
    }
    results.push(...validateSingleProp(validator, value, key, propsObject, state, objectParent, key))
  }

  // If we're doing an exact check, we also don't allow any values that don't have a validator
  // associated with them; that is, superfluous values. Pass on an error if there are any.
  if (isExact) {
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
