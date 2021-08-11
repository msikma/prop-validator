// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

const { walkProps } = require('./walk')
const { wrapInArray, wrapProps } = require('./util')

/**
 * Takes a PropTypes object, and a props object, and returns a complete list of validation results.
 * 
 * Results are returned in two arrays: one containing all validation results, and one with only errors.
 * In most cases you'll probably just want to know about the errors. Additionally, a boolean 'isValid' is
 * provided for convenience.
 * 
 * Errors include a brief human readable message explaining what's incorrect about the given data.
 * These can be customized a bit by providing an 'objectName' that will be included in this message.
 */
const validateProps = (passedPropTypes, passedPropsObject, objectName = []) => {
  const [propTypes, propsObject, objectPath] = wrapProps(passedPropTypes, passedPropsObject, objectName)
  const results = walkProps(propTypes, propsObject, objectPath)
  const errors = results.filter(res => !res.isValid)
  return {
    isValid: errors.length === 0,
    results,
    errors
  }
}

module.exports = {
  validateProps
}
