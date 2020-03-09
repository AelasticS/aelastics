/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { ComplexTypeC } from './ComplexType'
import {
  Error,
  failure,
  failures,
  failureValidation,
  isFailure,
  isSuccess,
  success
} from 'aelastics-result'

export class UnionTypeC extends ComplexTypeC {
  constructor(name, baseType) {
    super(name, baseType)
    this._tag = 'Union'
  }

  validate(value, path = []) {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let res = type.validate(value, path)
      if (isSuccess(res)) {
        return res
      }
    }
    return failure(new Error(`Value ${path}: '${value}' is not union: '${this.name}'`))
  }

  fromDTO(input, path = []) {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let res = type.fromDTO(input, path)
      if (isSuccess(res)) {
        return res
      }
    }
    return failureValidation(`Value ${path}: '${input}' is not union: '${this.name}'`, path, this.name, input)
  }

  // always validates besause otherwise input would serialize as first type in P[number]
  toDTO(input, path = []) {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let res = type.toDTO(input, path)
      if (isSuccess(res)) {
        return res
      }
    }
    return failureValidation(`Value ${path}: '${input}' is not union: '${this.name}'`, path, this.name, input)
  }

  getTypeFromValue(value) {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let res = type.validate(value)
      if (isSuccess(res)) {
        return success(type)
      }
    }
    return failure(new Error(`Value '${JSON.stringify(value)}' is not member of union '${this.name}'`))
  }

  validateLinks(traversed) {
    traversed.set(this, this)
    let errors = []
    for (let i = 0; i < this.baseType.length; i++) {
      const t = this.baseType[i]
      if (traversed.has(t)) {
        continue
      }
      let res = t.validateLinks(traversed)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }
    return errors.length ? failures(errors) : success(true)
  }
}

const getUnionName = (elements) => {
  return `(${elements.map(baseType => baseType.name).join(' | ')})`
}
export const unionOf = (elements, name = getUnionName(elements)) => {
  return new UnionTypeC(name, elements)
}
//# sourceMappingURL=UnionType.js.map
