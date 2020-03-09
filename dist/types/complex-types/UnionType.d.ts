import { ComplexTypeC } from './ComplexType'
import { Any , DtoTypeOf , TypeOf } from '../Type'
import { Path , Result } from 'aelastics-result'

export declare class UnionTypeC<P extends Array<Any>> extends ComplexTypeC<P , TypeOf<P[number]> , DtoTypeOf<P[number]>> {
  readonly _tag: 'Union'

  constructor(name: string , baseType: P);

  validate(value: TypeOf<P[number]> , path?: Path): Result<boolean>;

  fromDTO(input: DtoTypeOf<P[number]> , path?: Path): Result<TypeOf<P[number]>>;

  toDTO(input: TypeOf<P[number]> , path?: Path): Result<DtoTypeOf<P[number]>>;

  getTypeFromValue(value: TypeOf<P[number]>): Result<Any>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const unionOf: <P extends Any[]>(elements: P , name?: string) => UnionTypeC<P>
