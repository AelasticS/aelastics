/*
 * Copyright (c) AelasticS 2024.
 *
 */

import { Any } from '../type/Type'
import { ComplexType } from './ComplexType'
import { ExtraInfo } from '../type/Type'
import { Node } from '../common/Node'
import { TypeSchema } from '../type/TypeSchema'
import { DtoGraphTypeOf, DtoTreeTypeOf, TypeOf } from '../common/DefinitionAPI'
import { InstanceReference } from '../type/TypeDefinisions'


/**
 * Converts a union type `U` to an intersection type.
 *
 * This utility type takes a union type `U` and transforms it into an intersection type.
 * It works by leveraging TypeScript's conditional types and inference capabilities.
 *
 * @template U - The union type to be converted to an intersection type.
 * @returns The intersection type derived from the union type `U`.
 *
 * @example
 * type A = { a: string };
 * type B = { b: number };
 * type C = { c: boolean };
 * type Union = A | B | C;
 * type Intersection = UnionToIntersection<Union>; // { a: string } & { b: number } & { c: boolean }
 */
type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends (k: infer I) => void
  ? I
  : never

type DtoIntersectionType<P extends Array<Any>> = {
  ref: InstanceReference
  intersection: { [key: string]: DtoGraphTypeOf<P[number]> } // [K in keyof P[number]]
}

// export type DtoIntersectionType2<P extends Array<Any>> = {
//   ref: InstanceReference
//   intersection?: Array<DtoTypeOf<P[number]>> // [K in keyof P[number]]
// }


export class IntersectionType<P extends Array<Any>> extends ComplexType<

  UnionToIntersection<TypeOf<P[number]>>,
  DtoIntersectionType<P>,
  { [key: string]: DtoTreeTypeOf<P[number]> } 
> {
  readonly elements: P

  constructor(name: string, elements: P, schema: TypeSchema) {
    super(name, 'Intersection', schema)
    this.elements = elements
  }

  public *children(
    value: UnionToIntersection<TypeOf<P[number]>>
  ): Generator<[UnionToIntersection<TypeOf<P[number]>>, Any, ExtraInfo]> {
    for (const t of this.elements) {
      yield [value, t, { role: 'asElementOfIntersection' /* , propName: */ }]
    }
  }

 
  /**
   * Adds a child to a parent node in a specific manner based on their types.
   * 
   * @param parent - The parent node which can be an array, object, or undefined.
   * @param child - The child node which can be an array, object, or undefined.
   * @param n - A node parameter (not used in the current implementation).
   * 
   * The function performs the following actions based on the types of `parent` and `child`:
   * - If both `parent` and `child` are undefined, no action is taken.
   * - If `parent` is undefined, `child` is assigned as the new parent.
   * - If `child` is undefined, the parent is retained as is.
   * - If both `parent` and `child` are arrays, they are merged.
   * - If `parent` is an array and `child` is an object, `child`'s properties are added to the parent array.
   * - If `child` is an array and `parent` is an object, `parent`'s properties are added to the child array and `child` becomes the new parent.
   * - If both `parent` and `child` are objects, they are merged into the parent.
   * - If `parent` and `child` are primitives or incompatible types, `parent` is set to undefined.
   */
  addChild(parent: any, child: any, n: Node): void {
    if (parent === undefined && child === undefined) {
        // Both are undefined, no action to take
        return;
    }

    if (parent === undefined) {
        // Parent is undefined, assign child as new parent
        // This can happen because we initially set the value of intersection (i.e. parent) to be undefined
        parent = child;
        return;
    }

    if (child === undefined) {
        // Child is undefined, retain parent
        return;
    }

    if (Array.isArray(parent) && Array.isArray(child)) {
        // Both are arrays, merge them
        parent.push(...child);
        return;
    }

    if (Array.isArray(parent) && typeof child === 'object' && child !== null) {
        // Parent is array, child is object: Use Object.assign to add child's properties to parent array
        Object.assign(parent, child);
        return;
    }

    if (Array.isArray(child) && typeof parent === 'object' && parent !== null) {
        // Child is array, parent is object: Add parent’s properties to child array and make child the new parent
        Object.assign(child, parent);
        parent = child;
        return;
    }

    if (typeof parent === 'object' && typeof child === 'object' && parent !== null && child !== null) {
        // Both are objects, merge them into parent
        Object.assign(parent, child);
        return;
    }

       // If both are primitives or incompatible types, set parent to be undefined
    parent = undefined;
}


  init(n: Node): UnionToIntersection<TypeOf<P[number]>> {
    return undefined as any;
  }


}
