// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
// import { TypeC } from './common/Type'

import { Any } from './common/Type'

export { Type, Any, TypeOf, DtoTypeOf, DtoTreeTypeOf } from './common/Type'
export { boolean } from './simple-types/Boolean'
export { date } from './simple-types/DateType'
export { number } from './simple-types/Number'
export { string } from './simple-types/String'
export { object, entity, inverseProps } from './complex-types/ObjectType'
export { literal } from './simple-types/Literal'
export { taggedUnion } from './complex-types/TaggedUnionType'
export { optional } from './common/Optional'
export { arrayOf } from './complex-types/Array'
export { unionOf } from './complex-types/UnionType'
export { subtype } from './complex-types/Subtype'
export { mapOf } from './complex-types/Map'
export { fun, argsType, returnType } from './complex-types/FunctionalType'
export { intersectionOf } from './complex-types/IntersectionType'
export { schema, ValidateStatusEnum } from './common/TypeSchema'
export { ref, TypeOfKey, DtoTypeOfKey, DtoTreeTypeOfKey } from './common/EntityReference'
export { link } from './common/LinkC'

// tslint:disable-next-line:no-duplicate-imports
import * as ct from './common/Type'
import * as cot from './complex-types/ObjectType'
import * as cat from './complex-types/Array'
import * as cct from './complex-types/ComplexType'
import * as cft from './complex-types/FunctionalType'
import * as cit from './complex-types/IntersectionType'
import * as cmt from './complex-types/Map'
import * as cort from './common/EntityReference'
import * as cst from './complex-types/Subtype'
import * as ctut from './complex-types/TaggedUnionType'
import * as cut from './complex-types/UnionType'

import * as st from './simple-types/SimpleType'
import * as sto from './common/Optional'
import * as sts from './simple-types/String'
import * as stb from './simple-types/Boolean'
import * as stn from './simple-types/Number'
import * as stl from './simple-types/Literal'
import * as std from './simple-types/DateType'

import * as link from './common/LinkC'
import * as schema from './common/TypeSchema'

export namespace types {
  export type Type<T, D = T> = ct.TypeC<T, D>

  export function isType(v: any) {
    return v instanceof ct.TypeC
  }

  export type Any = ct.Any
  export type TypeOf<T extends Any> = ct.TypeOf<T>
  export type ObjectType<T extends cot.Props> = cot.ObjectType<T>
  export const isObjectType = (v: any) => v instanceof cot.ObjectTypeC

  export type DtoObjectType<T extends cot.Props> = cot.DtoObjectType<T>

  export type ArrayType<T extends ct.Any> = cat.ArrayTypeC<T>
  export const isArrayType = (v: any) => v instanceof cat.ArrayTypeC

  export type ComplexType<P, T extends any, D extends any = T> = cct.ComplexTypeC<T, D>
  export const isComplexType = (v: any) => v instanceof cct.ComplexTypeC

  export type FunctionalType<P extends cot.Props, R extends Any> = cft.FunctionalTypeC<P, R>
  export const isFunctionalType = (v: any) => v instanceof cft.FunctionalTypeC

  export type IntersectionType<P extends Array<Any>> = cit.IntersectionTypeC<P>
  export const isIntersectionType = (v: any) => v instanceof cit.IntersectionTypeC

  export type MapType<K extends Any, V extends Any> = cmt.MapTypeC<K, V>
  export const isMapType = (v: any) => v instanceof cmt.MapTypeC

  export type ObjReference<
    T extends cot.ObjectTypeC<any, readonly string[]>
  > = cort.EntityReference<T>
  export const isObjReference = (v: any) => v instanceof cort.EntityReference

  export type Subtype<
    P extends cot.Props,
    SP extends cot.Props,
    S extends cot.ObjectTypeC<cot.Props, readonly string[]>
  > = cst.SubtypeC<P, SP, S>
  export const isSubtype = (v: any) => v instanceof cst.SubtypeC

  export type TaggedUnionType<P extends cot.Props> = ctut.TaggedUnionTypeC<P>
  export const isTaggedUnionType = (v: any) => v instanceof ctut.TaggedUnionTypeC

  export type UnionType<P extends Any[]> = cut.UnionTypeC<P>
  export const isUnionType = (v: any) => v instanceof cut.UnionTypeC

  export type SimpleType<T> = st.SimpleTypeC<T>
  export const isSimpleType = (v: any) => v instanceof st.SimpleTypeC

  export type OptionalType<T extends Any> = sto.OptionalTypeC<T>
  export const isOptionalType = (v: any) => v instanceof sto.OptionalTypeC

  export type StringType = sts.StringTypeC
  export const isStringType = (v: any) => v instanceof sts.StringTypeC

  export type BooleanType = stb.BooleanTypeC
  export const isBooleanType = (v: any) => v instanceof stb.BooleanTypeC

  export type NumberType = stn.NumberTypeC
  export const isNumberType = (v: any) => v instanceof stn.NumberTypeC

  export type LiteralType<T extends stl.LiteralValue> = stl.LiteralTypeC<T>
  export const isLiteralType = (v: any) => v instanceof stl.LiteralTypeC

  export type DateType = std.DateTypeC
  export const isDateType = (v: any) => v instanceof std.DateTypeC

  export type TypeSchema = schema.TypeSchema
  export const isTypeSchema = (v: any) => v instanceof schema.TypeSchema

  export type LinkType = link.LinkC
  export const isLinkType = (v: any) => v instanceof link.LinkC
}
