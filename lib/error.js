// prop-validator <https://github.com/msikma/prop-validator>
// © MIT license

/**
 * Returns an error to throw when the user passes invalid options to any of the prop validators.
 */
const validatorError = message => (
  new class PropTypesValidatorError extends Error {
    constructor(args) {
      super(args)
      this.code = 'PROPTYPES_ERROR'
      this.message = message
    }
  }
)

module.exports = {
  validatorError
}
