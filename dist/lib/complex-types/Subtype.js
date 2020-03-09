/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { ObjectTypeC, isObject } from './ObjectType'
import {
  isFailure,
  failures,
  success,
  failureValidation,
  validationError,
  appendPath
} from 'aelastics-result'
import { OptionalTypeC } from '../'

export class SubtypeC extends ObjectTypeC {
  //    public readonly  extraProps:P;
  //    public readonly  superProps:SP;
  //    protected readonly superInstance: ObjectTypeC<P & SP>;
  constructor(name, baseType, superType) {
    // ToDo Nikola: verify that there are NO!!!! overriding properties (with same name as in supertype)
    super(name, baseType)
    this.superType = superType
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties() {
    let mp = this.superType.allProperties
    this.keys.forEach(key => {
      mp.set(key, this.baseType[key])
    })
    return mp
  }

  defaultValue() {
    return Object.assign(this.superType.defaultValue(), super.defaultValue())
  }

  validate(input, path = []) {
    let mapOfAllProperties = this.allProperties
    let keys = Array.from(mapOfAllProperties.keys())
    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }
    const errors = []
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]
      const t = mapOfAllProperties.get(k)
      if (t !== undefined) {
        if (!input.hasOwnProperty(k) && !(t instanceof OptionalTypeC)) {
          errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
          continue
        }
        const ak = input[k]
        const validation = t.validate(ak, appendPath(path, k, t.name, ak))
        if (isFailure(validation)) {
          errors.push(...validation.errors)
        }
      }
    }
    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(true)
  }

  // TODO: Consider property overriding
  fromDTO(input, path = []) {
    const resSuper = this.superType.fromDTO(input, path)
    const res = super.fromDTO(input, path)
    if (isFailure(resSuper)) {
      if (isFailure(res)) {
        //  both failure
        Object.assign(resSuper.errors, res.errors)
      }
      return resSuper
    } else {
      if (isFailure(res)) {
        // only res failure
        return res
      } else {
        // both success
        Object.assign(resSuper.value, res.value)
        return resSuper
      }
    }
  }

  toDTO(input, path = [], validate = true) {
    if (validate) {
      const res = this.validate(input, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }
    let resSuper = this.superType.toDTO(input, path, validate)
    let res = super.toDTO(input, path, validate)
    if (isFailure(resSuper)) {
      if (isFailure(res)) {
        //  both failure
        Object.assign(resSuper.errors, res.errors)
      }
      return resSuper
    } else {
      if (isFailure(res)) {
        // only res failure
        return res
      } else {
        // both success
        Object.assign(resSuper.value, res.value)
        return resSuper
      }
    }
  }

  validateLinks(traversed) {
    traversed.set(this, this)
    let mapOfAllProperties = this.allProperties
    let values = Array.from(mapOfAllProperties.values())
    let errors = []
    for (let i = 0; i < values.length; i++) {
      const t = values[i]
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

const getSubtypeName = (superType) => {
  return `subtype of ${superType.name})`
}
// @ts-ignore
export const subtype = (superType, extraProps, name = getSubtypeName(superType), schema, superProps = superType['baseType']) => new SubtypeC(name, extraProps, superType)
//# sourceMappingURL=Subtype.js.map
