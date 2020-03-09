/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { TypeC } from '../index'
import {
  appendPath,
  failures,
  failureValidation,
  isFailure,
  success,
  validationError
} from 'aelastics-result'

const isObject = (u) => u !== null && typeof u === 'object'

export class ObjReference extends TypeC {
  constructor(name, obj) {
    super(name)
    this.referencedType = obj
  }

  // ToDo: Ivana
  // value should be of type corresponding to the identifier of the referenced type
  validate(value /*IdentifierOfType<T>*/, path = []) {
    const result = isObject(value)
      ? success(value)
      : failureValidation('Value is not object', path, this.name, value)
    if (isFailure(result)) {
      return result
    }
    const identifier = this.referencedType.identifier
    const errors = []
    if (Object.keys(value).length > identifier.length) {
      const fail = failureValidation('Extra properties', path, this.name, value)
      if (isFailure(fail)) {
        return fail
      }
    }
    for (let i = 0; i < identifier.length; i++) {
      const k = identifier[i]
      if (value[k] === undefined) {
        errors.push(validationError('missing property', appendPath(path, k, this.referencedType.baseType[k]), this.name))
        continue
      }
      const ak = value[k]
      const t = this.referencedType.baseType[k]
      const validation = t.validate(ak, appendPath(path, k, t.name, ak))
      if (isFailure(validation)) {
        errors.push(...validation.errors)
      }
    }
    return errors.length ? failures(errors) : success(true)
  }

  // ToDo: Ivana
  fromDTO(value, path = []) {
    const result = isObject(value)
      ? success(value)
      : failureValidation('Value is not object', path, this.name, value)
    if (isFailure(result)) {
      return result
    }
    let a = {}
    const identifier = this.referencedType.identifier
    const errors = []
    if (Object.keys(value).length > identifier.length) {
      const fail = failureValidation('Extra properties', path, this.name, value)
      if (isFailure(fail)) {
        return fail
      }
    }
    for (let i = 0; i < identifier.length; i++) {
      const k = identifier[i]
      if (value[k] === undefined) {
        errors.push(validationError('missing property', appendPath(path, k, this.referencedType.baseType[k]), this.name))
        continue
      }
      const ak = value[k]
      const t = this.referencedType.baseType[k]
      const conversion = t.fromDTO(ak, appendPath(path, k, t.name, ak))
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // @ts-ignore
        a[k] = conversion.value
      }
    }
    return errors.length ? failures(errors) : success(a)
  }

  // ToDo: Ivana
  toDTO(value, path = [], validate = true) {
    if (validate) {
      const res = this.validate(value)
      if (isFailure(res)) {
        return res
      }
    }
    let a = {}
    const identifier = this.referencedType.identifier
    const errors = []
    for (let i = 0; i < identifier.length; i++) {
      const k = identifier[i]
      const ak = value[k]
      const t = this.referencedType.baseType[k]
      const conversion = t.toDTO(ak, appendPath(path, k, t.name, ak), validate)
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // @ts-ignore
        a[k] = conversion.value
      }
    }
    return success(a)
  }

  validateLinks(traversed) {
    return this.referencedType.validateLinks(traversed)
  }
}

export const ref = (t, name = `referenceTo${t.name}`) => new ObjReference(name, t)
//# sourceMappingURL=ObjReference.js.map
