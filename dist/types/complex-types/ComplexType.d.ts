import { TypeC } from '../Type'

/**
 *  Complex type: a structure which is derived from some type P
 */
export declare abstract class ComplexTypeC<P , T extends any , D extends any = T> extends TypeC<T , D> {
  readonly baseType: P

  constructor(name: string , baseType: P);
}
