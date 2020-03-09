import { Any , TypeC } from './Type'
import { Result } from 'aelastics-result'

export declare enum ValidateStatusEnum {
  invalid = 0 ,
  inValidatation = 1 ,
  valid = 2
}

/**
 *  Schema is a a container of types and other (sub)schemas
 *  Types and subschemas can be shared among schemas!
 */
export declare class TypeSchema {
  readonly name: string
  private _types
  private _subSchemas
  private _superSchema
  private _validateStatus

  constructor(name: string , superSchema?: TypeSchema);

  get isValid(): boolean;

  get validateStatus(): ValidateStatusEnum;

  addType(t: TypeC<any>): void;

  removeType(t: TypeC<any>): void;

  /**
   * Return a type by its name
   */
  getType(path: string): TypeC<any , any> | undefined;

  get types(): Array<TypeC<any>>;

  get subSchemas(): Array<TypeSchema>;

  invalidate(): void;

  /**
   *  ToDo:  Nikola: validation assumes that external references are resolved
   */
  validate(traversed?: Map<Any , Any>): Result<boolean>;
}

export declare const schema: (name: string , superSchema?: TypeSchema | undefined) => TypeSchema
