/*
 * Copyright (c) AelasticS 2019.
 *
 */
import {
  appendPath,
  Error,
  failure,
  failures,
  isFailure,
  success,
  validationError
} from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'

/**
 * Map type
 */
// Converting ES6 Maps to and from JSON
// http://2ality.com/2015/08/es6-map-json.html
export class MapTypeC extends ComplexTypeC {
  constructor(name, type, k) {
    super(name, type)
    this._tag = 'Map'
    this.keyType = k
  }

  defaultValue() {
    return new Map()
  }

  validate(input, path = []) {
    if (!(input instanceof Map)) {
      return failure(new Error(`Value ${path}: '${input}' is not valid Map`))
    }
    const errors = []
    input.forEach((value, key) => {
      let res = this.baseType.validate(value, appendPath(path, `[${key}]`, value.name))
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
      res = this.keyType.validate(key, appendPath(path, `[${key}]`, key.name))
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    })
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
    const a = new Map()
    const errors = []
    for (let i = 0; i < input.length; i++) {
      let newPath = appendPath(path, `[${i}]`, this.name)
      if (input[i].length !== 2) {
        errors.push(validationError('Invalid map element', newPath, this.name))
        continue
      }
      const k = input[i][0]
      const keyConversion = this.keyType.fromDTO(k, newPath)
      if (isFailure(keyConversion)) {
        errors.push(...keyConversion.errors)
        continue
      }
      const x = input[i][1]
      const valueConversion = this.baseType.fromDTO(x, newPath)
      if (isFailure(valueConversion)) {
        errors.push(...valueConversion.errors)
      } else {
        a.set(keyConversion.value, valueConversion.value)
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
    }
    const a = []
    const errors = []
    for (const [k, v] of input.entries()) {
      let newPath = appendPath(path, `[ ]`, this.name)
      const keyConversion = this.keyType.toDTO(k, newPath, validate)
      if (isFailure(keyConversion)) {
        errors.push(...keyConversion.errors)
        continue
      }
      const valueConversion = this.baseType.toDTO(v, newPath, validate)
      if (isFailure(valueConversion)) {
        errors.push(...valueConversion.errors)
      } else {
        a.push([k, v])
      }
    }
    /*  for (let i = 0; i < input.length; i++) {
             let newPath = appendPath(path, `[${i}]`,this.name);
             if(input[i].length != 2){
                 errors.push(validationError("Invalid map element",newPath, this.name));
                 continue;
             }
             const k:K = input[i][0];

             const keyConversion = this.keyType.toDTO(k, newPath);
             if (isFailure(keyConversion)) {
                 errors.push(...keyConversion.errors);
                 continue;
             }

             const x: V = input[i][1];

             const valueConversion = this.baseType.toDTO(x, newPath);
             if (isFailure(valueConversion)) {
                 errors.push(...valueConversion.errors);
             } else {
                 a.push(keyConversion.value, valueConversion.value)

             }
         } */
    return errors.length ? failures(errors) : success(a)
  }

  validateLinks(traversed) {
    traversed.set(this, this)
    let errors = []
    if (!traversed.has(this.baseType)) {
      let res = this.baseType.validateLinks(traversed)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }
    if (!traversed.has(this.keyType)) {
      let res2 = this.keyType.validateLinks(traversed)
      if (isFailure(res2)) {
        errors.push(...res2.errors)
      }
    }
    return errors.length ? failures(errors) : success(true)
  }
}

export const mapOf = (key, element, name = `MapOf<${element.name}>`) => {
  return new MapTypeC(name, element, key)
}
//# sourceMappingURL=Map.js.map
