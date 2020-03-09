import { Path , Result } from 'aelastics-result'
import { Any , DtoTypeOf , TypeC , TypeOf } from '../Type'

export declare class OptionalTypeC<T extends TypeC<any>> extends TypeC<TypeOf<T> | undefined , DtoTypeOf<T> | undefined> {
  readonly _tag: 'Optional'
  readonly base: T

  constructor(base: T , name?: string);

  validate(value: TypeOf<T> | undefined , path?: Path): Result<boolean>;

  fromDTO(value: DtoTypeOf<T> | undefined , path?: Path): Result<T | undefined>;

  /**
   * toDTO
   */
  toDTO(value: TypeOf<T> | undefined , path?: Path , validate?: boolean): Result<DtoTypeOf<T>>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare function optional<RT extends Any>(type: RT , name?: string): OptionalTypeC<RT>;
