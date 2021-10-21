[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) [![npm version](https://badge.fury.io/js/prop-validator.svg)](https://badge.fury.io/js/prop-validator)

# prop-validator

A simplified rewrite of the React PropTypes library, designed for use outside of React on arbitrary Javascript data.

This can be used as a quick and simple data validation tool—for example, to validate config files, or data passed by a user into a function.

## Usage

To validate an object:

```js
const { validateProps, PropTypes } = require('prop-validator')

const propTypes = {
  foo: PropTypes.string,
  bar: PropTypes.number,
  baz: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

const props = {
  foo: 'something',
  bar: 1234,
  baz: 'something else'
}

const { results, errors, isValid } = validateProps(propTypes, props)

console.log(isValid) // true

console.log(results) // see below
```

The `results` array will contain the following feedback:

```js
[
  {
    isValid: true,
    isRequired: false,
    valueType: 'string',
    valueExpectedType: 'string | null',
    valueExpectedTypeList: [ 'string', 'null' ],
    objectPath: 'foo',
    objectPathList: [ 'foo' ],
    key: 'foo',
    value: 'something',
    message: null,
    exception: null
  },
  {
    isValid: true,
    isRequired: false,
    valueType: 'number',
    valueExpectedType: 'number | null',
    valueExpectedTypeList: [ 'number', 'null' ],
    objectPath: 'bar',
    objectPathList: [ 'bar' ],
    key: 'bar',
    value: 1234,
    message: null,
    exception: null
  },
  {
    isValid: true,
    isRequired: false,
    valueType: 'string',
    valueExpectedType: 'string | number | null',
    valueExpectedTypeList: [ 'string', 'number', 'null' ],
    objectPath: 'baz',
    objectPathList: [ 'baz' ],
    key: 'baz',
    value: 'something else',
    message: null,
    exception: null
  }
]
```

Running the validator returns an object of two arrays: `results` and `errors`, and a boolean `isValid`. The former contains the validation results of all props, and the latter contains only any errors. If any errors were found, `isValid` will be false.

If a given prop is invalid, like if we instead set `bar` to `"1234"` instead of a string in the previous example, the given error message will be the following:

```
"Property 'bar' should be type 'number | null', but type 'string' was found"
```

As can be seen from the contents of the `results` array, all checks are permitted to have a `null` value as well (which can also be `undefined`). If a value *must* be present and be a given type, the `.isRequired` type can be referenced instead, e.g. `PropTypes.string.isRequired`.

### Nested type checking

Nested properties can be checked through the use of `PropTypes.shape()`:

```js
const propTypes = {
  options: PropTypes.shape({
    name: PropTypes.string,
    age: PropTypes.integer,
    job: PropTypes.shape({
      title: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string)
    })
  })
}

const props = {
  options: {
    name: 'Alice',
    age: 500,
    job: {
      title: 'CEO of Self-employed',
      tags: ['nothing', 'particularly', 'interesting']
    }
  }
}
```

All validation results, including the nested ones inside of a `PropTypes.shape()` object, are returned in the `results` and `errors` flat arrays.

Note that extra values are permitted inside of a `shape` object: it *only* checks whether all values *that exist* pass validation. If you must be sure that only the expected values are present and no others, the `PropTypes.exact()` validator can be used instead.

### Available type checkers

| Name   | Matches |
|:-------|:--------|
| string | Any string |
| number | Any number |
| numberRange(min, max) | Number in the range min ≤ n ≤ max, or another range type; see below |
| integer | Number that passes `Number.isInteger()` |
| integerRange(min, max) | Number that passes `Number.isInteger()` and is in a given range; see below |
| boolean | Any boolean (note: aliased as `bool`) |
| function | Any function (note: aliased as `func`) |
| object | Any plain object |
| symbol | Any symbol |
| array | Any array |
| regex | Any regular expression |
| error | Any error instance |
| any | Any defined value* |
| null | Only null |
| undefined | Only undefined\*\* |
| stringMatching(/regex/) | String that matches a given regular expression |
| oneOf([...values]) | Value that matches a given literal |
| oneOfType([...propTypes]) | Value that matches a given propType |
| arrayOf(propType) | Array containing only members of a given propType |
| objectOf(propType) | Plain object containing only values of a given propType |
| instanceOf(classObject) | Instance of a given class |
| customProp(func, type) | Value that passes the given validator function (`type` is for output) |
| shape({...propTypes}) | Plain object whose values pass a given propTypes object |
| exact({...propTypes}) | Plain object whose values pass a given propTypes object and which is not allowed to have extra values |

*: `any` still requires a value to be set when `.isRequired` is used, so it does not validate `undefined` in that case.

\*\*: `undefined` still accepts the `null` value if `.isRequired` is not used.

The `error` validator applies to any instance of an `Error` class or one that extends it (including `TypeError`, `RangeError`, etc).

### Number range checkers

The `numberRange` type checker has several different subtypes:

```js
const propTypes = {
  rangeA: PropTypes.numberRange(0, 5),                  // 0 ≤ n ≤ 5
  rangeB: PropTypes.numberRange.inclusive(0, 5),        // 0 ≤ n ≤ 5; alias for .numberRange
  rangeC: PropTypes.numberRange.exclusive(0, 5),        // 0 < n < 5
  rangeD: PropTypes.numberRange.greaterThan(5),         // n > 5
  rangeE: PropTypes.numberRange.greaterThanOrEqual(5),  // n ≥ 5
  rangeF: PropTypes.numberRange.lessThan(5),            // n < 5
  rangeG: PropTypes.numberRange.lessThanOrEqual(5)      // n ≤ 5
}
```

Additionally, the `integerRange` type checker does the exact same thing, except it also verifies if the given value is an integer.

### Differences with the original PropTypes library

The API is similar to the original PropTypes library, but there are a few small changes. Since this is not designed for React or DOM objects, the following types are not supported: `node`, `element`, `elementType`.

Conversely, this library contains the following validators that the original does not have: `numberRange()`, `integer`, `integerRange()`, `boolean` (`bool` in original), `function` (`func` in original), `regex`, `stringMatching()`, `error`, `null`, `undefined`.

In the original library, the `customProp()` validator has to throw an Error object; in this library, it needs to return true or false to indicate the validation result.

Additionally, the original PropTypes library only logs error strings directly to the console rather than returning an object of information.

## Links

* [React documentation - Typechecking With PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html)
* [Facebook PropTypes Library](https://github.com/facebook/prop-types)

## Copyright

MIT license
