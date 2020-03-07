/*
 * Copyright (c) AelasticS 2019.
 */

import {SimpleTypeC} from "./SimpleType";

export class BooleanTypeC extends SimpleTypeC<boolean> {
    public readonly _tag: 'Boolean' = 'Boolean';
    constructor(name: string) {
        super(name);
    }
}

/**
 *  boolean type
 */

export const boolean: BooleanTypeC = new BooleanTypeC('boolean');

boolean.addValidator({
    message: (value, label) => `Value ${label}="${value}" is not of type "${name}`,
    predicate: (value) => (typeof value === 'boolean')
});