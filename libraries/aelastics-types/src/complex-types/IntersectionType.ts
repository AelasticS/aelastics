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
  public addChild(parent: Record<string, any>, child: Record<string, any>, n: Node): void {
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

  public init(n: Node): UnionToIntersection<TypeOf<P[number]>> {
    return {} as any;
  }
}

