/*
 * Copyright (c) AelasticS 2019.
 *
 */
import {
  Error,
  failure,
  failures,
  isSuccess,
  pathToString,
  success,
  validationError
} from 'aelastics-result'

/**
 *  TypeC is a root of types hierarchy
 */
export class TypeC {
  // constructor
  constructor(name) {
    /** Array of functions checking constrains on values of this type */
    this.validators = []
    /** Custom type guard - implemented using the validation  function */
    this.is = (v) => isSuccess(this.validate(v, []))
    this.name = name
  }

  /**
   *  Default value of this type
   */
  defaultValue() {
    return undefined
  }

  /**
   * Validation functions - validates the shape structure, field values and all constrains (validators)
   *  The default implementation just check all validators. Should be overridden for more complex use cases.
   */
  validate(value, path = []) {
    if (typeof value === 'undefined') {
      return failure(new Error(`Value ${path}: '${value}' is undefined`))
    }
    return this.checkValidators(value, path) // (this as TypeC<any>).checkValidators(input, []);
  }

  /**
   *  Conversion function - validates value or plain object DTO (data transfer object) and returns either a new instance of t or errors, if validation fails;
   *  The default implementation just returns a copy of value, if it is valid. Should be overridden for more complex use cases.
   * @param value - to be converted,
   * @param path  - the path to this value within a larger object; if root, it is empty - which is the default value
   */
  fromDTO(value, path = []) {
    const res = this.validate(value, path)
    return isSuccess(res) ? success(value) : res
  }

  toDTO(value, path = [], validate = true) {
    if (validate) {
      const res = this.validate(value, path)
      return isSuccess(res) ? success(value) : res
    }
    return success(value)
  }

  addValidator(validator) {
    this.validators.push(validator)
    return this
  }

  // check validity with errorReport?
  checkValidators(value, path) {
    const errs = []
    let hasError = false
    let currentType = this
    while (currentType) {
      hasError = hasError ? hasError : this.checkOneLevel(currentType, value, errs, path)
      currentType = currentType.derivedFrom
    }
    return hasError ? failures(errs) : success(true)
  }

  get Required() {
    return this.addValidator({
      message: (value, label) => `Value of ${label} is required`,
      predicate: value => value === undefined
    })
  }

  derive(name = `derived from ${this.name}`) {
    const derived = new this.constructor(name)
    derived.derivedFrom = this
    return derived
  }

  checkOneLevel(currentType, value, errs, path) {
    let hasError = false
    for (const { predicate, message } of currentType.validators) {
      // if (value === undefined) { // no point of checking value constraint, other baseType checker will detect error
      //     continue;
      // }
      try {
        if (predicate(value)) {
          continue
        } else {
          hasError = true
        }
      } catch (e) {
        errs.unshift(validationError(e.message, path, this.name, value, 'ValidationError'))
        hasError = true
      }
      const m = message(value, pathToString(path))
      errs.unshift(validationError(m, path, this.name, value, 'ValidationError'))
    }
    return hasError
  }
}

export const getAtomValidator = (name) => ({
  message: (value, label) => `Value ${label}: "${value}" is not of type "${name}`,
  predicate: value => typeof value === name
})
// todo: Tuple
// Todo: Enum
//# sourceMappingURL=Type.js.map
