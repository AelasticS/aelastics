import { Any , DtoTypeOf , TypeC , TypeOf } from '../Type'
import { DtoObjectType , ObjectType , Props } from './ObjectType'
import { Result } from 'aelastics-result'

export declare type FunDecl<A , R> = {
  args: A;
  returns: R;
};

export declare class FunctionalTypeC<P extends Props , R extends Any> extends TypeC<FunDecl<ObjectType<P> , TypeOf<R>> , FunDecl<DtoObjectType<P> , DtoTypeOf<R>>> {
  readonly args: P
  readonly returns: R

  constructor(name: string , args: P , returns: R);

  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const fun: <P extends Props , R extends Any>(name: string , args: P , returns: R) => FunctionalTypeC<P , R>
export declare const returnType: <P extends Props , R extends Any>(f: FunctionalTypeC<P , R>) => R
export declare const argsType: <P extends Props , R extends Any>(f: FunctionalTypeC<P , R>) => P
