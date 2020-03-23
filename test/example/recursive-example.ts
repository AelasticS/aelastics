/*
 * Copyright (c) AelasticS 2019.
 */
import * as t from '../../src/aelastics-types'
import { DriverTypeLicences, DriverTypeProfession } from './types-example'

export const secondLevelObject = t.object(
  {
    name: t.string
  },
  'secondLevelObject'
)
export const rootLevelLevelObject = t.object(
  {
    a: secondLevelObject,
    b: secondLevelObject
  },
  'rootLevelObject'
)
/*


import * as t from "../index";

// 1.
export function lazyFunction(f:()=> t.Any) {
    return function () {
        // @ts-ignore
        return f.apply(this, arguments);
    };
}
const lazyTreeType1 = lazyFunction(() => treeType1);

export const treeType1 = t.object({info:t.string, children:t.arrayOf(lazyTreeType1())});

export const tree1:t.TypeOf<typeof treeType> = {info:"", children:[]};

// export const treeType = t.subtype(treeTypeAbs, {children:treeTypeAbs});


// 2.
/!*
export const recursiveType = <fn extends ()=>any>  (f:fn) => {
    const res:ReturnType<fn> = f();
    return res;
}
const lazyTreeType = recursiveType(() => treeType);
*!/


// 3.
export class RecursiveTypeC<fn extends ()=> t.Any> extends t.TypeC<ReturnType<fn>> {

    constructor(name: string , public readonly getTypeFun:fn) {
        super(name);
    }

    public getType():t.Any {return this.getType();}
}
export const recursiveType = <ft extends ()=> t.Any>  (f:ft)=> new RecursiveTypeC("recursive", f);

const lazyTreeType = lazyFunction(() => treeType);

export const treeType = t.object({info:t.string, children:t.arrayOf(recursiveType(lazyTreeType))});
export const tree:t.TypeOf<typeof treeType> = {info:"", children:[]};


*/
