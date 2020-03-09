/*
 * Copyright (c) AelasticS 2019.
 */
import { appendPath, Error, failure, failures, isFailure, success } from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'

/**
 * Array type
 */
export class ArrayTypeC extends ComplexTypeC {
  constructor(name, type) {
    super(name, type)
    this._tag = 'Array'
  }

  defaultValue() {
    return []
  }

  validate(input, path = []) {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${path}: '${input}' is not Array`))
    }
    const errors = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const validation = this.baseType.validate(x, appendPath(path, `[${i}]`, this.name))
      if (isFailure(validation)) {
        errors.push(...validation.errors)
      }
    }
    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(true)
  }

  fromDTO(input, path = []) {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${path}: '${input}' is not Array`))
    }
    const a = []
    const errors = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const conversion = this.baseType.fromDTO(x, [])
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        a.push(conversion.value)
      }
    }
    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(a)
  }

  toDTO(input, path = [], validate = true) {
    if (validate) {
      const res = this.validate(input, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    } else {
      if (!Array.isArray(input)) {
        return failure(new Error(`Value ${path}: '${input}' is not Array`))
      }
    }
    const a = []
    const errors = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const conversion = this.baseType.toDTO(x, [], validate)
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        a.push(conversion.value)
      }
    }
    /* const res = this.checkValidators(input, path);
        if (isFailure(res)) {
            errors.push(...res.errors)
        } */
    return errors.length ? failures(errors) : success(a)
  }

  validateLinks(traversed) {
    return this.baseType.validateLinks(traversed)
  }
}

/*export interface ArrayType<T extends Any> extends ArrayTypeC<T, Array<TypeOf<T>>> {
}*/
export const arrayOf = (element, name = `Array<${element.name}>`) => {
  return new ArrayTypeC(name, element)
}
//# sourceMappingURL=Array.js.map
