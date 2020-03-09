import { TypeC , ObjectTypeC , Any } from '../index'
import { Failure , Path , Result , Success } from 'aelastics-result'

export declare type IdentifierOfType<T extends ObjectTypeC<any>> = T extends ObjectTypeC<infer P> ? P : never;

export declare class ObjReference<T extends ObjectTypeC<any>> extends TypeC<IdentifierOfType<T>> {
  readonly referencedType: T

  constructor(name: string , obj: T);

  validate(value: any , path?: Path): Success<boolean> | Failure;

  fromDTO(value: any , path?: Path): Success<any> | Failure;

  toDTO(value: any , path?: Path , validate?: boolean): Success<any> | Failure;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const ref: (t: ObjectTypeC<any> , name?: string) => ObjReference<ObjectTypeC<any>>
