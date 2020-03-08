/*
 * Copyright (c) AelasticS 2019.
 */

import {TypeC} from "../Type";

/**
 *  Complex type: a structure which is derived from some type P
 */
export abstract class ComplexTypeC<P, T extends any, D extends any = T> extends TypeC<T, D> {
    constructor(
        name: string,
        readonly baseType: P,
    ) {
        super(name);
    }
}