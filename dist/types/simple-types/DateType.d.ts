import { SimpleTypeC } from './SimpleType'
import { Result , Path } from 'aelastics-result'

export declare class DateTypeC extends SimpleTypeC<Date , string> {
  readonly _tag: 'Date'

  constructor();

  validate(input: Date , path?: Path): Result<boolean>;

  fromDTO(value: string , path?: Path): Result<Date>;

  toDTO(d: Date): Result<string>;
}

/**
 *  date type
 */
export declare const date: DateTypeC
