/*
 * Copyright (c) AelasticS 2019.
 *
 */
import {
  appendPath,
  failures,
  failureValidation,
  isFailure,
  success,
  validationError
} from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import { OptionalTypeC } from '../index'

const hasOwnProperty = Object.prototype.hasOwnProperty
export const isObject = (u) => u !== null && typeof u === 'object'
export const getNameFromProps = (props) => `{ ${Object.keys(props)
  .map(k => `${k}: ${props[k].name}`)
  .join(', ')} }`

/**
 *  Object class with tree structure, i.e.  no cyclic references
 */
export class ObjectTypeC extends ComplexTypeC {
  constructor(name, props, identifier) {
    super(name, props)
    // { [K in keyof P]: TypeOf<P[K]> }> {
    this._tag = 'Object'
    this.keys = Object.keys(this.baseType)
    this.types = this.keys.map(key => this.baseType[key])
    this.len = this.keys.length
    this.identifier = []
    this.inverseCollection = new Map()
    if (identifier) {
      if (Array.isArray(identifier)) {
        this.identifier = Array.from(identifier)
      } else {
        this.identifier[0] = identifier
      }
      this.identifier.forEach(i => {
        if (!this.keys.includes(i)) {
          throw new Error(`Invalid identifier:${i} is not a property of obhect type ${name}`)
        }
      })
    }
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties() {
    let mp = new Map()
    this.keys.forEach(key => mp.set(key, this.baseType[key]))
    return mp
  }

  defaultValue() {
    const obj = {}
    for (let i = 0; i < this.len; i++) {
      // @ts-ignore
      obj[this.keys[i]] =
        this.types[i] instanceof ObjectTypeC ? undefined : this.types[i].defaultValue()
      // obj[this.keys[i]] = this.types[i].defaultValue();
    }
    return obj
  }

  validate(input, path = []) {
    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }
    const errors = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      const k = this.keys[i]
      if (!hasOwnProperty.call(input, k) && !(t instanceof OptionalTypeC)) {
        errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
        continue
      }
      const ak = input[k]
      const validation = t.validate(ak, appendPath(path, k, t.name, ak))
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
    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }
    // const o = result.value;
    let a = {}
    const errors = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      const k = this.keys[i]
      if (!hasOwnProperty.call(input, k) && !(t instanceof OptionalTypeC)) {
        errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
        continue
      }
      const ak = input[k]
      const conversion = t.fromDTO(ak, appendPath(path, k, t.name, ak))
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // const vak = conversion.value;
        // if (vak !== ak) {
        //
        //     if (a === o) { // make copy
        //         a = {...o}
        //     }
        //     a[k] = vak
        // }
        // Object.defineProperty(a, k,{value:conversion.value});

        a[k] = conversion.value
      }
    }
    const res = this.checkValidators(a, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(a)
  }

  // not sure if toDTO should do any validation
  toDTO(input, path = [], validate = true) {
    if (validate) {
      const res = this.validate(input)
      if (isFailure(res)) {
        return res
      }
    }
    let a = {}
    const errors = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      const k = this.keys[i]
      const ak = input[k]
      const conversion = t.toDTO(ak, appendPath(path, k, t.name, ak), validate)
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // Object.defineProperty(a, k,{value:conversion.value});

        a[k] = conversion.value
      }
    }
    return success(a)
  }

  validateLinks(traversed) {
    traversed.set(this, this)
    let errors = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      if (traversed.has(t)) {
        continue
      }
      const res = t.validateLinks(traversed)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }
    return errors.length ? failures(errors) : success(true)
  }
}

export const object = (props, name = getNameFromProps(props), schema, identifier) => {
  const obj = new ObjectTypeC(name, props, identifier)
  if (schema) {
    schema.addType(obj)
  }
  return obj
}
export const inverseProps = (firstType, firstProp, secondType, secondProp) => {
  // tslint:disable-next-line:no-constant-condition
  if (true) {
    // todo: Sinisa
    // check that props exist
    // check that props are object types or collections
    // check that prop already exist as an inverse, remove if true
    firstType.inverseCollection.set(firstProp, { prop: secondProp, type: secondType })
    secondType.inverseCollection.set(secondProp, { prop: firstProp, type: firstType })
  }
}
//# sourceMappingURL=ObjectType.js.map
