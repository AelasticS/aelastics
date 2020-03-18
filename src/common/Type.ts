/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  Errors,
  Error,
  failure,
  failures,
  isSuccess,
  Path,
  pathToString,
  Result,
  success,
  validationError
} from 'aelastics-result'
import { IObjectDescriptor, IObjectLiteral } from '../serializer/JsonDeserializer'

export type Predicate<T> = (value: T) => boolean

export type Valid<T> = (value: T) => boolean

export type Validation<T> = (value: T, path: Path) => Result<boolean>

export type Is<T> = (value: any) => value is T

export type vDeserialize<T> = (value: any, path: Path) => Result<T>

export type Conversion<In, Out> = (value: In, path: Path) => Result<Out>

export type Constructor<T extends {} = {}> = new (...args: any[]) => T

export interface ConversionOptions {
  validate: boolean
  generateID: boolean
  typeInfo: boolean
  classInstances: boolean // or POJO - Literal object
  constructors?: Map<string, Constructor> // constructors
}

export const defaultConversionOptions: ConversionOptions = {
  validate: true,
  generateID: false,
  typeInfo: false,
  classInstances: false
}

export interface Validator<T> {
  predicate: Predicate<T> // (value: t)=> boolean;
  message(value: T, label?: string, result?: any): string
}

export interface InstanceReference {
  id: number // unique identifier within object graph
  typeOf: string // instance category: Literal Object, or Typescript class
  className: string // used as a class name
}

/**
 *  TypeC is a root of types hierarchy
 */
export abstract class TypeC<T, D = T> {
  public readonly _T!: T // natural type
  public readonly _D!: D // DTO type

  //  public derivedFrom: TypeC<T, D>

  /** Unique name for this type */
  public readonly name: string

  /** Array of functions checking constrains on values of this type */
  private validators: Validator<T>[] = []

  // constructor
  constructor(name: string) {
    this.name = name
  }

  /**
   *  Default value of this type
   */
  public defaultValue(): any {
    return undefined
  }

  /** Custom type guard - implemented using the validation  function */
  public readonly is: Is<T> = (v: any): v is T => isSuccess(this.validate(v, []))

  /**
   * Validation functions - validates the shape structure, field values and all constrains (validators)
   *  The default implementation just check all validators. Should be overridden for more complex use cases.
   */

  public validate(value: T, path: Path = []): Result<boolean> {
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
  public fromDTO(value: D, path: Path = []): Result<T> {
    const res = this.validate((value as unknown) as T, path)
    return isSuccess(res) ? success<T>((value as unknown) as T) : res
  }

  /** @internal */
  public fromDTOCyclic(value: D, path: Path): Result<T> {
    const res = this.validate((value as unknown) as T, path)
    return isSuccess(res) ? success<T>((value as unknown) as T) : res
  }

  /**
   *  Conversion function - validates value of type T and converts it to DTO (data transfer object) of type D.
   *  Returns either a new instance of D or errors, if validation fails;
   *
   * @param value
   * @param options
   */
  public toDTO(
    value: T,
    options: ConversionOptions = {
      validate: true,
      generateID: false,
      typeInfo: false,
      classInstances: false
    }
  ): Result<D> {
    let convOptions = { ...options, ...{ counter: 0 } }
    if (options?.validate) {
      const res = this.validate(value, [])
      return isSuccess(res)
        ? this.toDTOCyclic(value, [], new Map<any, any>(), [], convOptions)
        : res
    }
    return this.toDTOCyclic(value, [], new Map<any, any>(), [], convOptions)
  }

  /*  private createObjectDescriptor(value: T): InstanceReference {
      return {
        id: ++this.counter,
        typeOf: typeof node,
        className: node.constructor.name
      }
    }*/

  //  ID generated, needed in case of graph structures
  //  literal objects or class instances

  /** @internal */
  public toDTOCyclic(
    input: T,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    options: ConversionOptions & { counter: number }
  ): Result<D> {
    return failure(validationError('Internal method toDTOCyclic not implemented', path, `${input}`))
  }

  public addValidator(validator: Validator<T>): this {
    this.validators.push(validator)
    return this
  }

  // check validity with errorReport?
  public checkValidators(value: any, path: Path): Result<boolean> {
    const errs: Errors = []
    let hasError: boolean = false

    let currentType: any = this
    while (currentType) {
      hasError = hasError ? hasError : this.checkOneLevel(currentType, value, errs, path)
      currentType = currentType.derivedFrom
    }

    return hasError ? failures(errs) : success(true)
  }

  public get Required(): this {
    return this.addValidator({
      message: (value, label) => `Value of ${label} is required`,
      predicate: value => value === undefined
    })
  }

  public derive(name: string = `derived from ${this.name}`): this {
    const derived = new (this.constructor as any)(name)
    derived.derivedFrom = this

    return derived
  }

  /** @internal */
  private checkOneLevel(currentType: TypeC<T>, value: any, errs: Errors, path: Path) {
    let hasError: boolean = false
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

  public abstract validateLinks(traversed: Map<Any, Any>): Result<boolean>
}

/**
 *  'any' type
 */
/*
export interface Any extends TypeC<any> {}
*/

export type Any = TypeC<any>

export type Type<T, D = T> = TypeC<T, D>

/**
 *  'type of' operator
 */
export type TypeOf<C extends Any> = C['_T']

export type DtoTypeOf<C extends Any> = C['_D']

export const getAtomValidator = <T>(name: string): Validator<T> => ({
  message: (value, label) => `Value ${label}: "${value}" is not of type "${name}`,
  predicate: value => typeof value === name
})

// todo: Tuple
// Todo: Enum
