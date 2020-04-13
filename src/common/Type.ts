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
  validationError,
  isFailure,
  ValidationError
} from 'aelastics-result'
import { VisitedNodes } from './VisitedNodes'

export type Predicate<T> = (value: T) => boolean

export type Valid<T> = (value: T) => boolean

export type Validation<T> = (value: T, path: Path) => Result<boolean>

export type Is<T> = (value: any) => value is T

export type vDeserialize<T> = (value: any, path: Path) => Result<T>

export type Conversion<In, Out> = (value: In, path: Path) => Result<Out>

export type Constructor<T extends {} = {}> = new (...args: any[]) => T

// Reference metadata for instances of complex  types
export interface InstanceReference {
  id: number // unique identifier within object graph
  category: string // instance category
  typeName: string // basic type name
  specificTypeName?: string // used as a the most specific type/class name in type hierarchy
}

/**
 *  options for conversion
 */

export interface ConversionOptions {
  validate: boolean // should validate during conversion, because of serializing partial data
  isTreeDTO: boolean // true if it is tree, false if it is graph
  includeTypeInfo: boolean // should put extra property in instance about its type or class
  typeInfoPropName: string // the name of this extra property
  //  instantiateClasses: boolean // put constructor name or POJO - Literal object
  constructors?: Map<string, Constructor> // constructors
}

const createVisitedNodesToDTO = () => new VisitedNodes<Any, any, InstanceReference>()

export type ToDtoContext = {
  options: ConversionOptions
  visitedNodes: VisitedNodes<Any, any, InstanceReference>
  errors: ValidationError[]
  counter: number
}

const createVisitedNodesFromDTO = () => new VisitedNodes<Any, number, any>()

export type FromDtoContext = {
  options: ConversionOptions
  visitedNodes: VisitedNodes<Any, number, any>
  errors: ValidationError[]
  //  counter: number
}

export const defaultConversionOptions: ConversionOptions = {
  validate: true,
  isTreeDTO: false,
  includeTypeInfo: false,
  typeInfoPropName: '_$_type_$'
  //  instantiateClasses: false
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
  public readonly is: Is<V> = (v: any): v is V => isSuccess(this.validate(v))

  /**
   * Validation functions - validates the shape structure, field values and all constrains (validators)
   *  The default implementation just check all validators. Should be overridden for more complex use cases.
   */

  public validate(value: V): Result<boolean> {
    return this.validateCyclic(value, [], new VisitedNodes())
  }

  public validateCyclic(
    value: V,
    path: Path = [],
    traversed: VisitedNodes<Any, any, any>
  ): Result<boolean> {
    return this.checkValidators(value, path) // (this as TypeC<any>).checkValidators(input, []);
  }

  /**
   *  Conversion function - validates value or plain object DTO (data transfer object) and returns either a new instance of t or errors, if validation fails;
   *  The default implementation just returns a copy of value, if it is valid. Should be overridden for more complex use cases.
   * @param value - to be converted,
   * @param options
   */
  public fromDTO(value: T | G, options: ConversionOptions = defaultConversionOptions): Result<V> {
    let context: FromDtoContext = {
      options: options,
      errors: [],
      visitedNodes: createVisitedNodesFromDTO()
    }
    let errs: ValidationError[] = []
    let res = this.fromDTOCyclic(value, [], context)
    if (errs.length > 0) {
      return failures(errs)
    } else {
      const resVal = this.validate(res as V)
      return isSuccess(resVal) ? success<V>(res as V) : resVal
    }
  }

  public fromDTOtree(value: T, options: ConversionOptions = defaultConversionOptions): Result<V> {
    let newOptions: ConversionOptions = { ...options, ...{ isTreeDTO: true } }
    return this.fromDTO(value, newOptions) as Result<V>
  }

  public fromDTOgraph(value: G, options: ConversionOptions = defaultConversionOptions): Result<V> {
    let newOptions: ConversionOptions = { ...options, ...{ isTreeDTO: false } }
    return this.fromDTO(value, newOptions) as Result<V>
  }

  /** @internal */
  public fromDTOCyclic(value: T | G, path: Path, context: FromDtoContext): V | undefined {
    context.errors.push(
      validationError('Internal method fromDTOCyclic not implemented', path, `${value}`)
    )
    return (value as any) as V
  }

  /**
   *  Conversion function - validates value of type T and converts it to DTO (data transfer object) of type D.
   *  Returns either a new instance of D or errors, if validation fails;
   *
   * @param value
   * @param options
   */
  public toDTO(value: V, options: ConversionOptions = defaultConversionOptions): Result<T | G> {
    if (options.validate) {
      let res = this.validate(value)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }
    let context: ToDtoContext = {
      options: options,
      errors: [],
      visitedNodes: createVisitedNodesToDTO(),
      counter: 0
    }
    let res = this.toDTOCyclic(value, [], context)
    if (context.errors.length > 0) {
      return failures(context.errors)
    } else {
      return success(res)
    }
  }

  public toDTOtree(value: V, options: ConversionOptions = defaultConversionOptions): Result<T> {
    let newOptions: ConversionOptions = { ...options, ...{ isTreeDTO: true } }
    return this.toDTO(value, newOptions) as Result<T>
  }

  public toDTOgraph(value: V, options: ConversionOptions = defaultConversionOptions): Result<G> {
    let newOptions: ConversionOptions = { ...options, ...{ isTreeDTO: false } }
    return this.toDTO(value, newOptions) as Result<G>
  }

  /** @internal */
  public toDTOCyclic(input: V, path: Path, context: ToDtoContext): T | G {
    context.errors.push(
      validationError('Internal method toDTOCyclic not implemented', path, `${input}`)
    )
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

export type Any = TypeC<any, any, any>

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
