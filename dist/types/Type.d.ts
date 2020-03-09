import { Path , Result } from 'aelastics-result'

export declare type Predicate<T> = (value: T) => boolean;
export declare type Valid<T> = (value: T) => boolean;
export declare type Validation<T> = (value: T , path: Path) => Result<boolean>;
export declare type Is<T> = (value: any) => value is T;
export declare type vDeserialize<T> = (value: any , path: Path) => Result<T>;
export declare type Conversion<In , Out> = (value: In , path: Path) => Result<Out>;

export interface Validator<T> {
  predicate: Predicate<T>;

  message(value: T , label?: string , result?: any): string;
}

/**
 *  TypeC is a root of types hierarchy
 */
export declare abstract class TypeC<T , D = T> {
  readonly _T: T
  readonly _D: D
  /** Unique name for this type */
  readonly name: string
  /** Array of functions checking constrains on values of this type */
  private validators

  constructor(name: string);

  /**
   *  Default value of this type
   */
  defaultValue(): any;

  /** Custom type guard - implemented using the validation  function */
  readonly is: Is<T>

  /**
   * Validation functions - validates the shape structure, field values and all constrains (validators)
   *  The default implementation just check all validators. Should be overridden for more complex use cases.
   */
  validate(value: T , path?: Path): Result<boolean>;

  /**
   *  Conversion function - validates value or plain object DTO (data transfer object) and returns either a new instance of t or errors, if validation fails;
   *  The default implementation just returns a copy of value, if it is valid. Should be overridden for more complex use cases.
   * @param value - to be converted,
   * @param path  - the path to this value within a larger object; if root, it is empty - which is the default value
   */
  fromDTO(value: D , path?: Path): Result<T>;

  toDTO(value: T , path?: Path , validate?: boolean): Result<D>;

  addValidator(validator: Validator<T>): this;

  checkValidators(value: any , path: Path): Result<boolean>;

  get Required(): this;

  derive(name?: string): this;

  private checkOneLevel

  abstract validateLinks(traversed: Map<Any , Any>): Result<boolean>;
}

/**
 *  'any' type
 */
export declare type Any = TypeC<any>;
/**
 *  'type of' operator
 */
export declare type TypeOf<C extends Any> = C['_T'];
export declare type DtoTypeOf<C extends Any> = C['_D'];
export declare const getAtomValidator: <T>(name: string) => Validator<T>
