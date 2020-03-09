import { Path , Result } from 'aelastics-result'
import { Any , DtoTypeOf , TypeOf } from '../Type'
import { ComplexTypeC } from './ComplexType'

/**
 * Array type
 */
export declare class ArrayTypeC<E extends Any> extends ComplexTypeC<E , Array<TypeOf<E>> , Array<DtoTypeOf<E>>> {
  readonly _tag: 'Array'

  constructor(name: string , type: E);

  defaultValue(): any;

  validate(input: Array<TypeOf<E>> , path?: Path): Result<boolean>;

  fromDTO(input: Array<DtoTypeOf<E>> , path?: Path): Result<Array<TypeOf<E>>>;

  toDTO(input: Array<TypeOf<E>> , path?: Path , validate?: boolean): Result<Array<DtoTypeOf<E>>>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const arrayOf: <T extends Any>(element: T , name?: string) => ArrayTypeC<T>
