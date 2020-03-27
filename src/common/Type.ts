/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  failure,
  failures,
  isSuccess,
  Path,
  pathToString,
  Result,
  success,
  validationError,
  isFailure,
  Errors,
  ValidationError
} from 'aelastics-result'

export type Predicate<T> = (value: T) => boolean

export type Valid<T> = (value: T) => boolean

export type Validation<T> = (value: T, path: Path) => Result<boolean>

export type Is<T> = (value: any) => value is T

export type vDeserialize<T> = (value: any, path: Path) => Result<T>

export type Conversion<In, Out> = (value: In, path: Path) => Result<Out>

export type Constructor<T extends {} = {}> = new (...args: any[]) => T

export interface ConversionOptions {
  validate: boolean // should validate , because of serializing partial data
  generateID: boolean // generateID if it is graph
  typeInfo: boolean // should put meta type info
  typeInfoPropName: string
  instantiateClasses: boolean // put constructor name or POJO - Literal object
  constructors?: Map<string, Constructor> // constructors
}

export type ConversionContext = ConversionOptions & { counter: number }

export const defaultConversionOptions: ConversionOptions = {
  validate: true,
  generateID: false,
  typeInfo: false,
  typeInfoPropName: '_$_type_$',
  instantiateClasses: false
}

export interface Validator<T> {
  predicate: Predicate<T> // (value: t)=> boolean;
  message(value: T, label?: string, result?: any): string
}

/**
 *  TypeC is a root of types hierarchy
 */
export abstract class TypeC<V, G = V, T = V> {
  public readonly _V!: V // natural value type
  public readonly _G!: G // graph DTO type
  public readonly _T!: T // tree DTO type

  //  public derivedFrom: TypeC<T, D>

  /** Unique name for this type within a type schema */
  public readonly shortName: string

  // full name, e.g. /schema/sub-schema/type-name
  get name(): string {
    return this.shortName
  }

  /** Array of functions checking constrains on values of this type */
  private validators: Validator<V>[] = []

  // constructor
  constructor(name: string) {
    this.shortName = name
  }

  /**
   *  Default value of this type
   */
  public defaultValue(): any {
    return undefined
  }

  /** Custom type guard - implemented using the validation  function */
  public readonly is: Is<V> = (v: any): v is V => isSuccess(this.validate(v, []))

  /**
   * Validation functions - validates the shape structure, field values and all constrains (validators)
   *  The default implementation just check all validators. Should be overridden for more complex use cases.
   */

  public validate(value: V, path: Path = []): Result<boolean> {
    if (typeof value === 'undefined') {
      return failure(new Error(`Value ${path}: '${value}' is undefined`))
    }
    return this.checkValidators(value, path) // (this as TypeC<any>).checkValidators(input, []);
  }

  /**
   *  Conversion function - validates value or plain object DTO (data transfer object) and returns either a new instance of t or errors, if validation fails;
   *  The default implementation just returns a copy of value, if it is valid. Should be overridden for more complex use cases.
   * @param value - to be converted,
   * @param options
   */
  public fromDTO(value: G, options: ConversionOptions = defaultConversionOptions): Result<V> {
    let convOptions = { ...options, ...{ counter: 0 } }
    let errs: ValidationError[] = []
    let res = this.fromDTOCyclic(value, [], new Map<any, any>(), errs, convOptions)
    if (errs.length > 0) {
      return failures(errs)
    } else {
      const resVal = this.validate(res as V, [])
      return isSuccess(resVal) ? success<V>(res as V) : resVal
    }
  }

  /** @internal */
  public fromDTOCyclic(
    value: any,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: ValidationError[],
    context: ConversionContext
  ): V | undefined {
    errors.push(validationError('Internal method fromDTOCyclic not implemented', path, `${value}`))
    return (value as any) as V
  }

  /**
   *  Conversion function - validates value of type T and converts it to DTO (data transfer object) of type D.
   *  Returns either a new instance of D or errors, if validation fails;
   *
   * @param value
   * @param options
   */
  public toDTO(value: V, options: ConversionOptions = defaultConversionOptions): Result<G> {
    if (options.validate) {
      let res = this.validate(value, [])
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }
    let convOptions = { ...options, ...{ counter: 0 } }
    let errs: ValidationError[] = []
    let res = this.toDTOCyclic(value, [], new Map<any, any>(), errs, convOptions)
    if (errs.length > 0) {
      return failures(errs)
    } else {
      return success(res)
    }
  }

  /** @internal */
  public toDTOCyclic(
    input: V,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: ValidationError[],
    context: ConversionContext
  ): G {
    errors.push(validationError('Internal method toDTOCyclic not implemented', path, `${input}`))
    return (input as any) as G
  }

  public addValidator(validator: Validator<V>): this {
    this.validators.push(validator)
    return this
  }

  // check validity with errorReport?
  public checkValidators(value: any, path: Path): Result<boolean> {
    const errs: ValidationError[] = []
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
  private checkOneLevel(currentType: TypeC<V>, value: any, errs: ValidationError[], path: Path) {
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

export type Type<V, G = V> = TypeC<V, G>

/**
 *  'type of' operator
 */
export type TypeOf<C extends Any> = C['_V']

export type DtoTypeOf<C extends Any> = C['_G']

export type DtoTreeTypeOf<C extends Any> = C['_T']

export const getAtomValidator = <T>(name: string): Validator<T> => ({
  message: (value, label) => `Value ${label}: "${value}" is not of type "${name}`,
  predicate: value => typeof value === name
})

// todo: Tuple
// Todo: Enum
