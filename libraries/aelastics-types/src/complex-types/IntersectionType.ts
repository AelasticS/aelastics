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
import { ObjectType } from './ObjectType'


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



// new version of IntersectionType
export class IntersectionType<P extends Array<any>> extends ComplexType<
  UnionToIntersection<TypeOf<P[number]>>,
  DtoIntersectionType<P>,
  { [key: string]: DtoTreeTypeOf<P[number]> }
> {
  readonly elements: P;

  constructor(name: string, elements: P, schema: TypeSchema) {
    // Validate that all elements are object types
    if (!elements.every((el) => el instanceof ObjectType)) {
      throw new Error(
        `IntersectionType can only be created with object types. Invalid element found in: ${JSON.stringify(
          elements
        )}`
      );
    }

    super(name, 'Intersection', schema);
    this.elements = elements;
  }

  public *children(
    value: UnionToIntersection<TypeOf<P[number]>>
  ): Generator<[UnionToIntersection<TypeOf<P[number]>>, any, ExtraInfo]> {
    for (const t of this.elements) {
      yield [value, t, { role: 'asElementOfIntersection' }];
    }
  }

  /**
   * Adds a child to a parent node in a specific manner based on their types.
   *
   * @param parent - The parent node, must be an object.
   * @param child - The child node, must be an object.
   * @param n - A node parameter (not used in the current implementation).
   */
  addChild(parent: Record<string, any>, child: Record<string, any>, n: Node): void {
    if (typeof parent !== 'object' || parent === null) {
      throw new Error(
        `IntersectionType requires parent to be a valid object. Received: ${typeof parent}`
      );
    }

    if (typeof child !== 'object' || child === null) {
      throw new Error(
        `IntersectionType only supports objects as children. Received: ${typeof child}`
      );
    }

    // Merge the child into the parent
    Object.assign(parent, child);
  }

  init(n: Node): UnionToIntersection<TypeOf<P[number]>> {
    return {} as any;
  }
}


/////////////////////////////////////////////////////////////
// old version which allows for primitives

// export class IntersectionType1<P extends Array<Any>> extends ComplexType<

//   UnionToIntersection<TypeOf<P[number]>>,
//   DtoIntersectionType<P>,
//   { [key: string]: DtoTreeTypeOf<P[number]> } 
// > {
//   readonly elements: P

//   constructor(name: string, elements: P, schema: TypeSchema) {
//     super(name, 'Intersection', schema)
//     this.elements = elements
//   }

//   public *children(
//     value: UnionToIntersection<TypeOf<P[number]>>
//   ): Generator<[UnionToIntersection<TypeOf<P[number]>>, Any, ExtraInfo]> {
//     for (const t of this.elements) {
//       yield [value, t, { role: 'asElementOfIntersection' /* , propName: */ }]
//     }
//   }

//   /**
//    * Adds a child to a parent node in a specific manner based on their types.
//    * 
//    * @param parent - The parent node which can be an array, object, or undefined.
//    * @param child - The child node which can be an array, object, or undefined.
//    * @param n - A node parameter (not used in the current implementation).
//    * 
//    * The function performs the following actions based on the types of `parent` and `child`:
//    * - If both `parent` and `child` are undefined, no action is taken.
//    * - If `parent` is undefined, `child` is assigned as the new parent.
//    * - If `child` is undefined, the parent is retained as is.
//    * - If both `parent` and `child` are arrays, they are merged.
//    * - If `parent` is an array and `child` is an object, `child`'s properties are added to the parent array.
//    * - If `child` is an array and `parent` is an object, `parent`'s properties are added to the child array and `child` becomes the new parent.
//    * - If both `parent` and `child` are objects, they are merged into the parent.
//    * - If `parent` and `child` are primitives or incompatible types, `parent` is set to undefined.
//    */
//   addChild(parent: any, child: any, n: Node): void {
//     if (parent === undefined && child === undefined) {
//         // Both are undefined, no action to take
//         return;
//     }

//     if (parent === undefined) {
//         // Parent is undefined, assign child as new parent
//         // This can happen because we initially set the value of intersection (i.e. parent) to be undefined
//         parent = child;
//         return;
//     }

//     if (child === undefined) {
//         // Child is undefined, retain parent
//         return;
//     }

//     if (Array.isArray(parent) && Array.isArray(child)) {
//         // Both are arrays, merge them
//         parent.push(...child);
//         return;
//     }

//     if (Array.isArray(parent) && typeof child === 'object' && child !== null) {
//         // Parent is array, child is object: Use Object.assign to add child's properties to parent array
//         Object.assign(parent, child);
//         return;
//     }

//     if (Array.isArray(child) && typeof parent === 'object' && parent !== null) {
//         // Child is array, parent is object: Add parent’s properties to child array and make child the new parent
//         Object.assign(child, parent);
//         parent = child;
//         return;
//     }

//     if (typeof parent === 'object' && typeof child === 'object' && parent !== null && child !== null) {
//         // Both are objects, merge them into parent
//         Object.assign(parent, child);
//         return;
//     }

//        // If both are primitives or incompatible types, set parent to be undefined
//     parent = undefined;
// }


//   init(n: Node): UnionToIntersection<TypeOf<P[number]>> {
//     return undefined as any;
//   }


// }
