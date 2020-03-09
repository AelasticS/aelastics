import { SimpleTypeC } from './SimpleType'
import { Path , Result } from 'aelastics-result'

declare type LiteralValue = string | number | boolean;

/**
 *  Literal TypeC
 */
export declare class LiteralTypeC<V extends LiteralValue> extends SimpleTypeC<V> {
  readonly value: V
  readonly _tag: 'Literal'

  constructor(value: V , name: string);

  validate(input: LiteralValue , path: Path): Result<boolean>;
}

/**
 * Literal type
 * @param value
 */
export declare const literal: <V extends string | number | boolean>(value: V) => LiteralTypeC<V>
export {}
