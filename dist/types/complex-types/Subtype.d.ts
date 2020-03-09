import { ObjectType , ObjectTypeC , Props , DtoObjectType } from './ObjectType'
import { Result , Path } from 'aelastics-result'
import { Any , TypeC } from '../Type'
import { TypeSchema } from '../TypeSchema'

export declare class SubtypeC<P extends Props , SP extends Props , S extends ObjectTypeC<Props>> extends ObjectTypeC<P & SP> {
  readonly superType: ObjectTypeC<Props>

  constructor(name: string , baseType: P , superType: ObjectTypeC<Props>);

  get allProperties(): Map<string , TypeC<any>>;

  defaultValue(): any;

  validate(input: ObjectType<P & SP> , path?: Path): Result<boolean>;

  fromDTO(input: DtoObjectType<P & SP> , path?: Path): Result<ObjectType<P & SP>>;

  toDTO(input: ObjectType<P & SP> , path?: Path , validate?: boolean): Result<DtoObjectType<P & SP>>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const subtype: <P extends Props , S extends Props>(superType: ObjectTypeC<S> , extraProps: P , name?: string , schema?: TypeSchema | undefined , superProps?: S) => SubtypeC<P , S , ObjectTypeC<Props>>
