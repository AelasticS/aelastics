import { Path , Result } from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import { Any , DtoTypeOf , TypeC , TypeOf } from '../Type'
import { TypeSchema } from '../TypeSchema'

export interface Props {
  [key: string]: Any;
}

export declare type ObjectType<P extends Props> = {
  [K in keyof P]: TypeOf<P[K]>;
};
export declare type DtoObjectType<P extends Props> = {
  [K in keyof P]: DtoTypeOf<P[K]>;
};
export declare const isObject: (u: any) => boolean
export declare const getNameFromProps: (props: Props) => string

/**
 *  Object class with tree structure, i.e.  no cyclic references
 */
export declare class ObjectTypeC<P extends Props> extends ComplexTypeC<P , ObjectType<P> , DtoObjectType<P>> {
  readonly _tag: 'Object'
  readonly keys: string[]
  readonly types: TypeC<any , any>[]
  readonly len: number
  readonly identifier: Array<string>
  inverseCollection: Map<string , {
    prop: string;
    type: ObjectTypeC<any>;
  }>

  constructor(name: string , props: P , identifier?: string | Array<string>);

  get allProperties(): Map<string , TypeC<any>>;

  defaultValue(): any;

  validate(input: ObjectType<P> , path?: Path): Result<boolean>;

  fromDTO(input: DtoObjectType<P> , path?: Path): Result<ObjectType<P>>;

  toDTO(input: ObjectType<P> , path?: Path , validate?: boolean): Result<DtoObjectType<P>>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const object: <P extends Props>(props: P , name?: string , schema?: TypeSchema | undefined , identifier?: string | string[] | undefined) => ObjectTypeC<P>
export declare const inverseProps: (firstType: ObjectTypeC<any> , firstProp: string , secondType: ObjectTypeC<any> , secondProp: string) => void
