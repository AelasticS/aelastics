import { SimpleTypeC } from './SimpleType'

export declare class StringTypeC extends SimpleTypeC<string> {
  readonly _tag: 'String'

  constructor(name: string);

  /**
   * Test a string to have a specific length.
   *
   * @param length The length of the string.
   */
  length(length: number): this;

  /**
   * Test a string to have a minimum length.
   *
   * @param length The minimum length of the string.
   */
  minLength(length: number): this;

  /**
   * Test a string to have a maximum length.
   *
   * @param length The maximum length of the string.
   */
  maxLength(length: number): this;

  /**
   * Test a string against a regular expression.
   *
   * @param regExp
   */
  matches(regExp: RegExp): this;

  /**
   * Test a string to start with a specific value.
   *
   * @param searchString The value that should be the start of the string.
   */
  startsWith(searchString: string): this;

  /**
   * Test a string to end with a specific value.
   *
   * @param searchString The value that should be the end of the string.
   */
  endsWith(searchString: string): this;

  /**
   * Test a string to include a specific value.
   *
   * @param searchString The value that should be included in the string.
   */
  includes(searchString: string): this;

  /**
   * Test if the string is an element of the provided list.
   *
   * @param list List of possible values.
   */
  oneOf(list: string[]): this;

  /**
   * Test a string to be empty.
   */
  get empty(): this;

  /**
   * Test a string to be not empty.
   */
  get nonEmpty(): this;

  /**
   * Test a string to be equal to a specified string.
   *
   * @param expected Expected value to match.
   */
  equals(expected: string): this;

  /**
   * Test a string to be alphanumeric.
   */
  get alphanumeric(): this;

  /**
   * Test a string to be a proper word
   */
  get word(): this;

  /**
   * Test a string to be alphabetical.
   */
  get alphabetical(): this;

  /**
   * Test a string to be numeric.
   */
  get numeric(): this;

  /**
   * Test a non-empty string to be lowercase. Matching both alphabetical & numbers.
   */
  get lowercase(): this;

  /**
   * Test a non-empty string to be uppercase. Matching both alphabetical & numbers.
   */
  get uppercase(): this;

  /**
   * email type
   */
  get email(): this;
}

/**
 *  String type
 */
export declare const string: StringTypeC
