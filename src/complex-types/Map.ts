/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  appendPath,
  Error,
  Errors,
  failure,
  failures,
  isFailure,
  Path,
  success,
  validationError,
  Result
} from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import { Any, DtoTypeOf, TypeOf } from '../common/Type'

/**
 * Map type
 */

// Converting ES6 Maps to and from JSON
// http://2ality.com/2015/08/es6-map-json.html

export class MapTypeC<K extends Any, V extends Any> extends ComplexTypeC<
  V,
  Map<TypeOf<K>, TypeOf<V>>,
  Array<[DtoTypeOf<K>, DtoTypeOf<V>]>
> {
  public readonly _tag: 'Map' = 'Map'
  public readonly keyType: K
  constructor(name: string, type: V, k: K) {
    super(name, type)
    this.keyType = k
  }

  public defaultValue(): any {
    return new Map()
  }

  public validate(
    input: Map<TypeOf<K>, TypeOf<V>>,
    path: Path = [],
    traversed?: Map<Any, Any>
  ): Result<boolean> {
    if (!(input instanceof Map)) {
      return failure(new Error(`Value ${path}: '${input}' is not valid Map`))
    }

    if (traversed === undefined) {
      traversed = new Map<Any, Any>()
    }

    traversed.set(this, this)

    const errors: Errors = []

    input.forEach((value: V, key: K) => {
      let res
      // Is this good way to cancel undefined check?
      // @ts-ignore
      if (!traversed.has(value)) {
        res = this.baseType.validate(value, appendPath(path, `[${key}]`, value.name, traversed))
        if (isFailure(res)) {
          errors.push(...res.errors)
        }
      }
      // @ts-ignore
      if (!traversed.has(key)) {
        res = this.keyType.validate(key, appendPath(path, `[${key}]`, key.name, traversed))
        if (isFailure(res)) {
          errors.push(...res.errors)
        }
      }
    })

    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(true)
  }

  public fromDTO(input: any, path: Path = []): Result<Map<K, V>> {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${path}: '${input}' is not Array`))
    }

    const a: Map<K, TypeOf<V>> = new Map()
    const errors: Errors = []

    for (let i = 0; i < input.length; i++) {
      let newPath = appendPath(path, `[${i}]`, this.name)
      if (input[i].length !== 2) {
        errors.push(validationError('Invalid map element', newPath, this.name))
        continue
      }
      const k: K = input[i][0]

      const keyConversion = this.keyType.fromDTO(k, newPath)
      if (isFailure(keyConversion)) {
        errors.push(...keyConversion.errors)
        continue
      }

      const x: V = input[i][1]

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

  public toDTO(
    input: Map<TypeOf<K>, TypeOf<V>> | Map<K, V>,
    path: Path = [],
    validate: boolean = true
  ): Result<Array<[K, V]>> {
    if (validate) {
      const res = this.validate(input, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }
    const a: Array<[K, TypeOf<V>]> = []
    const errors: Errors = []

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

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
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

export const mapOf = <K extends Any, V extends Any>(
  key: K,
  element: V,
  name: string = `MapOf<${element.name}>`
): MapTypeC<K, V> => {
  return new MapTypeC<K, V>(name, element, key)
}
