// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
export { Type, Any, TypeOf, DtoTypeOf } from './common/Type'
export { boolean } from './simple-types/Boolean'
export { date } from './simple-types/DateType'
export { number } from './simple-types/Number'
export { string } from './simple-types/String'
export { object, inverseProps } from './complex-types/ObjectType'
export { literal } from './simple-types/Literal'
export { taggedUnion } from './complex-types/TaggedUnionType'
export { optional } from './simple-types/Optional'
export { arrayOf } from './complex-types/Array'
export { unionOf } from './complex-types/UnionType'
export { subtype } from './complex-types/Subtype'
export { mapOf } from './complex-types/Map'
export { fun, argsType, returnType } from './complex-types/FunctionalType'
export { intersectionOf } from './complex-types/IntersectionType'
export { schema, ValidateStatusEnum } from './common/TypeSchema'
export { ref } from './complex-types/ObjReference'
export { link } from './common/LinkC'

import * as ct from './common/Type'
import * as cot from './complex-types/ObjectType'
import * as cat from './complex-types/Array'
import * as cct from './complex-types/ComplexType'
import * as cft from './complex-types/FunctionalType'
import * as cit from './complex-types/IntersectionType'
import * as cmt from './complex-types/Map'
import * as cort from './complex-types/ObjReference'
import * as cst from './complex-types/Subtype'
import * as ctut from './complex-types/TaggedUnionType'
import * as cut from './complex-types/UnionType'

export namespace types {
  export type Type<T, D = T> = ct.TypeC<T, D>
  export type Any = ct.Any
  export type TypeOf<T extends Any> = ct.TypeOf<T>
  export type ObjectType<T extends cot.Props> = cot.ObjectType<T>
  export type DtoObjectType<T extends cot.Props> = cot.DtoObjectType<T>

  export type ArrayType<T extends ct.Any> = cat.ArrayTypeC<T>
  export type ComplexType<T extends ct.Any> = cct.ComplexTypeC<T, any>
  export type FunctionalType<T extends cot.Props> = cft.FunctionalTypeC<T, any>
  export type IntersectionType<P extends Array<Any>> = cit.IntersectionTypeC<P>
  export type MapType<T extends ct.Any> = cmt.MapTypeC<T, any>
  export type ObjReference<T extends cot.ObjectTypeC<any>> = cort.ObjReference<T>
  export type Subtype<
    P extends cot.Props,
    SP extends cot.Props,
    S extends cot.ObjectTypeC<cot.Props>
  > = cst.SubtypeC<P, SP, S>
  export type TaggedUnionType<Tag extends string, P extends cot.Props> = ctut.TaggedUnionTypeC<
    Tag,
    P
  >
  export type UnionType<P extends Any[]> = cut.UnionTypeC<P>
}
