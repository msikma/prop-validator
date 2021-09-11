// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

class PropTypesValidatorErrorBase extends Error {
  constructor(args) {
    super(args)
    this.code = 'PROPTYPES_ERROR'
  }
}

/**
 * Returns an error to throw when the user passes invalid options to any of the prop validators.
 */
const validatorError = message => (
  new class PropTypesValidatorError extends PropTypesValidatorErrorBase {
    constructor(args) {
      super(args)
      this.message = message
    }
  }
)

module.exports = {
  validatorError,
  PropTypesValidatorErrorBase
}
