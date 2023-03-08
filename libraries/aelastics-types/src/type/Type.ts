/*
 * Copyright (c) AelasticS 2020.
 */

import { ErrorObject, TypeCategory } from './TypeDefinisions';
import { Any } from '../common/DefinitionAPI';
import { Node } from '../common/Node';
import { DefaultSchema, System, TypeSchema } from './TypeSchema';
import { failures, ServiceError, ServiceResult, success } from 'aelastics-result';
import { ITransformer, WhatToDo } from '../transducers/Transformer';
import { identityReducer, naturalReducer, transducer } from '../transducers/Transducer';
import { NaturalReducer } from '../transducers/NaturalReducer';
import { AnnotationTransformer, IAnnotationProcessor } from '../transducers/AnnotationTransformer'

export type RoleType =
  | 'asRoot'
  | 'asProperty'
  | 'asArrayElement'
  | 'asIdentifierPart'
  | 'asElementOfTaggedUnion';
export type Position = 'OnEntry' | 'AfterChild' | 'OnExit';

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

export interface Validator<T> {
  predicate: (value: T) => boolean;
  message(value: T, label?: string, result?: any): string;
}

export abstract class Type<V, G, T> {
  readonly _V!: V; // natural value type
  readonly _G!: G; // graph DTO type
  readonly _T!: T; // tree DTO type
  readonly name: string; // Must be unique name within the owner schema
  readonly typeCategory: TypeCategory;
  readonly isSystemType: boolean = false;
  public ownerSchema: TypeSchema;
  public derivedFrom?: Type<any, any, any> 

  /** Array of functions checking constrains on values of this type */
  private validators: Validator<V>[] = [];

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
  private get pathFromRoot(): string {
    return this.isSystemType ? '' : `${this.ownerSchema.path}/${this.ownerSchema.name}`;
  }

  /**
   *  name including path from the root schema
   */
  public get fullPathName(): string {
    return `${this.pathFromRoot}/${this.name}`;
  }

  abstract isSimple(): boolean;
  

  public derive(name?: string, schema: TypeSchema = DefaultSchema): this {
    if (name === undefined || name === '') {
      name = schema.generateName(`derived from ${this.fullPathName}`);
    }
    const derived = new (this.constructor as any)(name, this.typeCategory, schema);
    derived.derivedFrom = this;
    return derived;
  }

  public isOfType(t:Type<any,any,any>):boolean {
    if (t === this)
      return true
    else if (this.derivedFrom && this.derivedFrom.isOfType(t))
           return true
    else
      return false  
}


  public addValidator(validator: Validator<V>): this {
    if (this.isSystemType) {
      throw new ServiceError(
        'OperationNotAllowed',
        `Type '${this.name}' is a system type. New constrains are not allowed! Define a derived type instead.`
      );
    }
    this.validators.push(validator);
    return this;
  }
  // check validity with errorReport?
  public checkValidators(value: any): ServiceResult<boolean> {
    // ToDo cumulative errors
    const errs: ServiceError[] = [];
    let hasError: boolean = false;

    let currentType: any = this;
    while (currentType) {
      hasError = hasError ? hasError : this.checkOneLevel(currentType, value, errs);
      currentType = currentType.derivedFrom;
    }

    return hasError ? failures(errs) : success(true);
  }

  /** @internal */
  private checkOneLevel(currentType: Any, value: any, errs: ServiceError[]) {
    let hasError: boolean = false;
    for (const { predicate, message } of currentType.validators) {
      try {
        if (predicate(value)) {
          continue;
        } else {
          hasError = true;
        }
      } catch (e) {
        errs.unshift(new ServiceError((e as any)["message"], this.name, value));
        hasError = true;
      }
      // ToDo path for messages in validations
      const m = message(value, this.name);
      errs.unshift(new ServiceError('ValidationError', m, this.name));
    }
    return hasError;
  }

  transduce<A>(t: ITransformer, input: any | Node, initObj?: A, resetAcc?: boolean): A {
    let [res, _] = this.doTransformation(t, input, initObj, resetAcc);
    return res;
  }

  abstract doTransformation<A>(
    t: ITransformer,
    input: any | Node,
    initObj?: A,
    resetAcc?: boolean
  ): [A, WhatToDo];

  // children iterator
  abstract children(i: V, n: Node): Generator<[V, Any, ExtraInfo]>; // node

  /**
   * init - create an empty instance
   * @param n
   */
  abstract init(n: Node): V;

  /**
   *  Add a child to a parent object
   * @param parent
   * @param child
   * @param n
   */
  abstract addChild(parent: any, child: any, n: Node): void;

  /**
   * validate some input value, returns [hasErrors, errorObject]
   * @param input
   *
   * example :
   *  let p: t.TypeOf<typeof Person> = {
   *        name: 'Elon Musk',
   *        age: "not so old",
   *        children: [{ name: 'X Æ A-12' }],
   *      }
   *   let [hasErrors, errObj] = Person.validate(p)
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

  validate(input: V): ServiceResult<boolean> {
    let [res, errorObj] = this.validateAndReport(input);
    if (res) {
      return success(res);
    } else return failures(errorObj['@errors'] as ServiceError[]);
  }

  /**
   *  convert input object of type V into graph formatted Data Transfer Object
   * @param input
   */
  toDtoGraph(input: V): G {
    // ToDo validation before toDTO?
    const tr = transducer().recurse('makeItem').toDtoGraph().doFinally(identityReducer()); // make transformer with identity reducer
    const res = this.transduce<G>(tr, input);
    return res;
  }

  /**
   *  convert input graph formatted Data Transfer Object into object of type V
   * @param input
   */
  fromDtoGraph(input: G): V {
    // ToDo validation after fromDTO?
    let tr = transducer().recurse('makeItem').fromDtoGraph().doFinally(identityReducer()); // make transformer with identity reducer
    const res = this.transduce<V>(tr, input);
    return res;
  }

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
