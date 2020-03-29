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
  Result,
  ValidationError
} from 'aelastics-result'
import { ComplexTypeC, InstanceReference } from './ComplexType'
import { Any, ConversionContext, DtoTypeOf, TypeOf } from '../common/Type'

/**
 * Map type
 */

// Converting ES6 Maps to and from JSON
// http://2ality.com/2015/08/es6-map-json.html

type DtoMapType<K extends Any, V extends Any> = {
  ref: InstanceReference
  map: Array<[DtoTypeOf<K>, DtoTypeOf<V>]>
}

export class MapTypeC<K extends Any, V extends Any> extends ComplexTypeC<
  V,
  Map<TypeOf<K>, TypeOf<V>>,
  DtoMapType<K, V>,
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

  public validate(input: Map<TypeOf<K>, TypeOf<V>>, path: Path = []): Result<boolean> {
    if (!(input instanceof Map)) {
      return failure(new Error(`Value ${path}: '${input}' is not valid Map`))
    }
    const errors: Errors = []

    input.forEach((value: V, key: K) => {
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

  makeInstanceFromDTO(
    input: DtoMapType<K, V>,
    path: Path,
    context: ConversionContext
  ): Map<TypeOf<K>, TypeOf<V>> {
    const output: Map<K, TypeOf<V>> = new Map<TypeOf<K>, TypeOf<V>>()
    if (!Array.isArray(input.map)) {
      context.errors.push(
        validationError(
          `Value ${path}: '${input}' is not a map represented as an array`,
          path,
          this.name,
          input
        )
      )
      return output
    }
    for (let i = 0; i < input.map.length; i++) {
      let newPath = appendPath(path, `[${i}]`, this.name)
      if (input.map[i].length !== 2) {
        context.errors.push(validationError('Invalid map element', newPath, this.name))
        continue
      }
      const k: K = input.map[i][0]
      const keyConversion = this.keyType.fromDTOCyclic(k, newPath, context)
      const x: V = input.map[i][1]
      const valueConversion = this.baseType.fromDTOCyclic(x, newPath, context)
      output.set(keyConversion, valueConversion)
    }
    return output
  }

  makeDTOInstance(
    input: Map<TypeOf<K>, TypeOf<V>>,
    path: Path,
    context: ConversionContext
  ): DtoMapType<K, V> {
    const output: DtoMapType<K, V> = { ref: this.makeReference(input, context), map: [] }
    for (const [k, v] of input.entries()) {
      let newPath = appendPath(path, `[${k}]`, this.name)
      const keyConversion = this.keyType.toDTOCyclic(k, newPath, context)
      const valueConversion = this.baseType.toDTOCyclic(v, newPath, context)
      output.map.push([k, v])
    }
    return output
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
