import { SimpleTypeC } from './SimpleType'

export declare class BooleanTypeC extends SimpleTypeC<boolean> {
  readonly _tag: 'Boolean'

  constructor(name: string);
}

/**
 *  Boolean type
 */
export declare const boolean: BooleanTypeC
