/*
 * Copyright (c) AelasticS 2020.
 */

import { ErrorObject, TypeCategory } from './TypeDefinisions';
import { Any } from '../common/DefinitionAPI';
import { Node } from '../common/Node';
import { DefaultSchema, System, TypeSchema } from './TypeSchema';
import { failures, ServiceError, ServiceResult, success } from 'aelastics-result';
import { IProcessor, WhatToDo } from '../transducers/Processor';
import { identityReducer, naturalReducer, transducer } from '../transducers/Transducer';

/**
 * Role types representing different positions a node can have within a data structure.
 */
export type RoleType =
  | 'asRoot'
  | 'asProperty'
  | 'asArrayElement'
  | 'asIdentifierPart'
  | 'asElementOfTaggedUnion'
  | 'asElementOfIntersection';


/**
 * Additional information that can be associated with nodes in the data structure.
 */
export type ExtraInfo = Partial<{
  role: RoleType;
  propName: string;
  index: number;
  parentType: Any;
  parentInstance: any;
  parentResult: any;
  childExtra: {};
  optional: boolean;
}>;

/**
 * Validator interface that describes a predicate function for validating data,
 * along with an error messaging function.
 */
export interface Validator<T> {
  predicate: (value: T) => boolean;
  message(value: T, label?: string, result?: any): string;
}

/**
 * Abstract class representing a generic data type with validation and transformation capabilities.
 * It supports operations across three types of data representations: natural, graph, and tree DTOs.
 */
export abstract class Type<V, G, T> {
  // The natural value type
  readonly _V!: V;
  // The graph Data Transfer Object (DTO) type
  readonly _G!: G;
  // The tree DTO type
  readonly _T!: T;
  // Unique name within the owner schema
  readonly name: string;
  // The category of the type which helps in defining its behavior and properties
  readonly typeCategory: TypeCategory;
  // Indicates if this type is part of the system's core schema
  readonly isSystemType: boolean = false;
  // The schema to which this type belongs
  public ownerSchema: TypeSchema;
  // Base type from which this type is derived, if any
  public derivedFrom?: Type<any, any, any>;

  // Array of validators checking constraints on values of this type
  private validators: Validator<V>[] = [];

/**
   * Constructs a new Type instance.
   * @param name The name of the type, unique within its schema.
   * @param typeCategory The category of the type, which helps in defining its behavior and properties.
   * @param schema The schema to which this type belongs.
   * @param validator Optional validator to apply to values of this type.
   */
constructor(name: string, typeCategory: TypeCategory, schema: TypeSchema, validator?: Validator<V>) {
  this.name = name;
  this.ownerSchema = schema;
  this.typeCategory = typeCategory;
  if (validator) {
    this.addValidator(validator);
  }
  if (schema === System) {
    this.isSystemType = true;
    System._types.set(this.name, this);
  } else {
    schema.addType(this);
  }
}

/**
 * Retrieves the path from the root schema, if applicable.
 */
private get pathFromRoot(): string {
  return this.isSystemType ? '' : `${this.ownerSchema.path}/${this.ownerSchema.name}`;
}

/**
 * Returns the full path name of the type, including its path from the root schema.
 */
public get fullPathName(): string {
  return `${this.pathFromRoot}/${this.name}`;
}

/**
 * Abstract method to determine if the type is simple.
 */
abstract isSimple(): boolean;

/**
 * Derives a new type from this type.
 * @param name The name of the new derived type, optional.
 * @param schema The schema for the new type, defaults to DefaultSchema if not provided.
 * @returns A new instance of the derived type.
 */
public derive(name?: string, schema: TypeSchema = DefaultSchema): this {
  if (name === undefined || name === '') {
    name = schema.generateName(`derived from ${this.fullPathName}`);
  }
  const derived = new (this.constructor as any)(name, this.typeCategory, schema);
  derived.derivedFrom = this;
  return derived;
}
/**
   * Checks if this type is of or derived from another type.
   * @param t The type to check against.
   * @returns true if this type is or derives from the given type.
   */
public isOfType(t: Type<any, any, any>): boolean {
  // TODO: Reimplement this method to handle intersection types. (Iterate over elements of the intersection type)
  return t === this || (this.derivedFrom?.isOfType(t))?true:false
}

/**
 * Adds a validator to this type.
 * @param validator The validator to add.
 * @returns this instance for chaining.
 */
public addValidator(validator: Validator<V>): this {
  if (this.isSystemType) {
    throw new ServiceError(
      'OperationNotAllowed',
      `Type '${this.name}' is a system type. New constraints are not allowed! Define a derived type instead.`
    );
  }
  this.validators.push(validator);
  return this;
}

/**
 * Checks the validators for the given value, accumulating errors.
 * @param value The value to check.
 * @returns A ServiceResult indicating success or failure with detailed errors.
 */
public checkValidators(value: any): ServiceResult<boolean> {
  const errs: ServiceError[] = [];
  let hasError: boolean = false;
  let currentType: any = this;
  while (currentType) {
    hasError = hasError || this.checkOneLevel(currentType, value, errs);
    currentType = currentType.derivedFrom;
  }
  return hasError ? failures(errs) : success(true);
}

/**
 * Helper method to check validators at one level.
 * @internal
 * @param currentType The current type context.
 * @param value The value to validate.
 * @param errs Array to accumulate errors.
 * @returns true if an error was found.
 */
private checkOneLevel(currentType: Any, value: any, errs: ServiceError[]): boolean {
  let hasError: boolean = false;
  for (const { predicate, message } of currentType.validators) {
    if (!predicate(value)) {
      errs.unshift(new ServiceError('ValidationError', message(value, this.name), this.name));
      hasError = true;
    }
  }
  return hasError;
}
/**
 * Transforms the input data using the specified processor.
 * @param t The processor to use for transformation.
 * @param input The input data or node.
 * @param initObj The initial object to start with.
 * @param resetAcc Whether to reset the accumulator.
 * @param typeLevel Whether the transformation should consider type level specifics.
 * @returns The transformed data.
 */
transduce<A>(t: IProcessor, input: any | Node, initObj?: A, resetAcc?: boolean, typeLevel:boolean=false): A {
  let [res, _] = this.doTransformation(t, input, initObj, resetAcc, typeLevel);
  return res;
}

/**
 * Abstract method to handle the transformation process.
 * Must be implemented by subclasses to define specific transformation behaviors.
 * @param t The processor to use for transformation.
 * @param input The input data or node.
 * @param initObj The initial object to start with.
 * @param resetAcc Whether to reset the accumulator.
 * @param typeLevel Whether the transformation should consider type level specifics.
 * @returns A tuple containing the transformed data and the next action.
 */
abstract doTransformation<A>(
  t: IProcessor,
  input: any | Node,
  initObj?: A,
  resetAcc?: boolean,
  typeLevel?:boolean
): [A, WhatToDo];

/**
 * Abstract method to iterate over children of a given value within a node.
 * Must be implemented by subclasses to handle specific child iteration logic.
 * @param i The instance whose children to iterate over.
 * @param n The node context for the iteration.
 * @returns A generator yielding tuples of child values, their types, and extra information.
 */
abstract children(i: V, n: Node): Generator<[V, Any, ExtraInfo]>;

/**
 * Abstract method to initialize and create an empty instance of the type.
 * Must be implemented by subclasses to define how new instances are created.
 * @param n The node context for the initialization.
 * @returns An initialized, empty instance of the type.
 */
abstract init(n: Node): V;

/**
 * Abstract method to add a child to a parent object within the context of a node.
 * Must be implemented by subclasses to define how children are added to parent instances.
 * @param parent The parent object to add a child to.
 * @param child The child object to add.
 * @param n The node context for adding the child.
 */
abstract addChild(parent: any, child: any, n: Node): void;

/**
 * Validates the input value and reports any errors encountered.
 * @param input The input value to validate.
 * @returns A tuple indicating whether validation passed and any error object associated with failures.
 */
validateAndReport(input: V): [boolean, ErrorObject] {
  let res: any;
  try {
    const tr = transducer()
      .recurse('makeItem')
      .validate()
      .filter((item, currNode) => item && item['@hasErrors'])
      .doFinally(naturalReducer());
    res = this.transduce(tr, input);
    if (res && res['@hasErrors']) {
      return [false, res];
    }
    return [true, res];
  } catch (e) {
    if (res === undefined) {
      res = { '@hasErrors': true, '@errors': [(e as any)["message"]] };
    }
    return [false, res];
  }
}

/**
 * Simplifies the process of validating a value, directly returning a service result indicating success or failure.
 * @param input The input value to validate.
 * @returns A ServiceResult indicating whether the input is valid, along with detailed error information if not.
 */
validate(input: V): ServiceResult<boolean> {
  let [res, errorObj] = this.validateAndReport(input);
  if (res) {
    return success(res);
  } else return failures(errorObj['@errors'] as ServiceError[]);
}

/**
 * Converts an input object of natural value type into a graph-formatted Data Transfer Object.
 * @param input The input object to convert.
 * @returns The converted graph DTO.
 */
toDtoGraph(input: V): G {
  const tr = transducer().recurse('makeItem').toDtoGraph().doFinally(identityReducer());
  return this.transduce<G>(tr, input);
}

/**
 * Converts an input graph-formatted Data Transfer Object back into the natural value type.
 * @param input The graph DTO to convert.
 * @returns The converted natural value type.
 */
fromDtoGraph(input: G): V {
  let tr = transducer().recurse('makeItem').fromDtoGraph().doFinally(identityReducer());
  return this.transduce<V>(tr, input);
}

/**
 * Creates a new instance of the type, potentially using a provided input as the basis.
 * @param input Optional input to use as the basis for the new instance.
 * @returns The newly created instance.
 */
createInstance(input?: any) {
  let tr = transducer().recurse('makeItem').newInstance(input).doFinally(naturalReducer());
  let obj = this.transduce(tr, undefined);
  return obj;
}

  /** ToDo: Reduce
   *  - reduceType, reduceBoth
   *  - or have an option in context to specify behavior: OnlyInstances, OnlyTypes, Both
   *  - hwo to integrate DeepReduce, DeepMap, DeepFilter, functions for every type:
   *      - for every category: objects, array, etc.
   *      - for every concrete type: object Person, array Children, etc.
   *
   */

  /** ToDo:
   *  validation - filter // reduce, map
   *  from DTO - map
   *  to DTO - map
   *  create new instance - map, reduce
   *  make observable - map
   *  compare two instances - map, reduce
   *
   */
}
export { Any };

