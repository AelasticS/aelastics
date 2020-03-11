// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
// import { TypeC } from './common/Type'

import { Any } from './common/Type'

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

import * as st from './simple-types/SimpleType'
import * as sto from './simple-types/Optional'
import * as sts from './simple-types/String'
import * as stb from './simple-types/Boolean'
import * as stn from './simple-types/Number'
import * as stl from './simple-types/Literal'
import * as std from './simple-types/DateType'

import * as link from './common/LinkC'
import * as schema from './common/TypeSchema'

export namespace types {
  export type Type<T, D = T> = ct.TypeC<T, D>
  export type Any = ct.Any
  export type TypeOf<T extends Any> = ct.TypeOf<T>
  export type ObjectType<T extends cot.Props> = cot.ObjectType<T>
  export type DtoObjectType<T extends cot.Props> = cot.DtoObjectType<T>

  export type ArrayType<T extends ct.Any> = cat.ArrayTypeC<T>
  export type ComplexType<P, T extends any, D extends any = T> = cct.ComplexTypeC<T, D>
  export type FunctionalType<T extends cot.Props> = cft.FunctionalTypeC<T, any>
  export type IntersectionType<P extends Array<Any>> = cit.IntersectionTypeC<P>
  export type MapType<K extends Any, V extends Any> = cmt.MapTypeC<K, V>
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

  export type SimpleType<T> = st.SimpleTypeC<T>
  export type OptionalType<T extends Any> = sto.OptionalTypeC<T>
  export type StringType = sts.StringTypeC
  export type BooleanType = stb.BooleanTypeC
  export type NumberType = stn.NumberTypeC
  export type LiteralType<T extends stl.LiteralValue> = stl.LiteralTypeC<T>
  export type DateType = std.DateTypeC

  export type TypeSchema = schema.TypeSchema
  export type LinkType = link.LinkC
}
