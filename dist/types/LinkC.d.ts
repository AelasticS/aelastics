import { Any , TypeC } from './Type'
import { TypeSchema } from './TypeSchema'
import { Result } from 'aelastics-result'

export declare class LinkC extends TypeC<any> {
  readonly schema: TypeSchema
  readonly path: string
  private resolvedType

  constructor(name: string , schema: TypeSchema , path: string);

  isResolved(): TypeC<any , any> | undefined;

  resolveType(): TypeC<any> | undefined;

  /**
   *  ToDo:  Nikola: validation assumes that external references are resolved
   */
  validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

export declare const link: (schema: TypeSchema , path: string , name?: string) => LinkC
