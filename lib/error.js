// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

/**
 * Error thrown when the user passes invalid options to any of the prop validators.
 */
class PropTypesValidatorError extends Error {
  constructor(message, args) {
    super(args)
    this.code = 'PROPTYPES_ERROR'
    this.message = message
  }
}

module.exports = {
  PropTypesValidatorError
}
