import { Any , DtoTypeOf , TypeOf } from '../Type'
import { ComplexTypeC } from './ComplexType'
import { Path , Result } from 'aelastics-result'

declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export declare class IntersectionTypeC<P extends Array<Any>> extends ComplexTypeC<P , UnionToIntersection<TypeOf<P[number]>> , UnionToIntersection<DtoTypeOf<P[number]>>> {
  readonly _tag: 'Intersection'

  validate(value: UnionToIntersection<TypeOf<P[number]>> , path?: Path): Result<boolean>;

  fromDTO(value: UnionToIntersection<DtoTypeOf<P[number]>> , path?: Path): Result<UnionToIntersection<TypeOf<P[number]>>>;

  toDTO(value: UnionToIntersection<TypeOf<P[number]>> , path?: Path , validate?: boolean): Result<UnionToIntersection<DtoTypeOf<P[number]>>>;

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const intersectionOf: <P extends Any[]>(elements: P , name?: string) => IntersectionTypeC<P>
export {}
