/*
 * Copyright (c) AelasticS 2020.
 *
 */

import * as types from '..'

type TO = types.ObjectType<any, any>
type TS = types.SimpleType<any, any, any>

// keywordsae
export enum KeyWord {
  PROPERTIES = '$props',
  ELEMENT = '$elem',

  KEY = '$key',
  VALUE = '$value',
  TAGGED = '$union',
  UNION = '$union',
  INTERSECTION = '$intersection',
  SUPER = '$super',
}

export const isAnnotationKeyWord = (s: string): boolean =>
  s === KeyWord.ELEMENT ||
  s === KeyWord.UNION ||
  s === KeyWord.INTERSECTION ||
  s === KeyWord.KEY ||
  s === KeyWord.PROPERTIES ||
  s === KeyWord.TAGGED ||
  s === KeyWord.VALUE ||
  s === KeyWord.SUPER

export type AnnotationSchema<
  S extends TO | TS,
  O extends TO,
  //  M extends TO = O,
  A extends TO = O,
  //  U extends TO = O,
  TU extends TO = O,
  //  I extends TO = O,
  R extends TO | TS = S
  //  F extends TO = O
> = {
  simpleSchema: S
  objectSchema: O
  //    mapSchema:M,
  arraySchema: A
  //    unionSchema:U,
  taggedUnionSchema: TU
  //    intersectionSchema:I,
  refObjSchema: R
  //    functionSchema:F
}

// ToDo: check if the second declaration is better
export type AnySchema = AnnotationSchema<any, any> // AnnotationSchema<TO>
// ToDo Sinisa
export type anyPartSchema<S extends AnySchema> = S[keyof S]

// export interface NamedAnnotation {
//   name: string
//   annotation: Annotation<any, any>
// }

export type AnyAnnotation = Annotation<any, any>

export type Annotation<T, S extends AnySchema> =
  | AnnotateSimple<T, S>
  | AnnotateComplex<T, S>
  | AnnotateOptional<T, S>
  | AnnotateReference<T, S>
  | AnnotateLink<T, S>

export type AnnotateOptional<
  T,
  S extends AnySchema
> = T extends types.OptionalType<any>
  ? T['base'] extends types.ComplexType<any, any, any>
    ? AnnotateComplex<T['base'], S>
    : AnnotateSimple<T['base'], S>
  : never

export type AnnotateReference<
  T,
  S extends AnySchema
> = T extends types.EntityReference<any> ? types.TypeOf<S['refObjSchema']> : never

export type AnnotateLink<T, S extends AnySchema> = T extends types.LinkType
  ?
      | types.TypeOf<S['simpleSchema']>
      | types.TypeOf<S['objectSchema']>
      //      | types.TypeOf<S['mapSchema']>
      | types.TypeOf<S['arraySchema']>
      //      | types.TypeOf<S['unionSchema']>
      | types.TypeOf<S['taggedUnionSchema']>
      //      | types.TypeOf<S['intersectionSchema']>
      | types.TypeOf<S['refObjSchema']>
  : //      | types.TypeOf<S['functionSchema']>
    never

export type AnnotateComplex<T, S extends AnySchema> =
  | AnnotateObject<T, S>
  //    | AnnotateUnion<T, S>
  | AnnotateTaggedUnion<T, S>
  | AnnotateArray<T, S>
//    | AnnotateMap<A,T,S>
//    | AnnotateIntersection<A,T,S>

export type AnnotateObject<T, S extends AnySchema> = T extends types.Subtype<
  infer P,
  any,
  any
>
  ? AnnotateSubtypeProps<T, S> & types.TypeOf<S['objectSchema']> // ToDO fix
  : T extends types.ObjectType<any, any>
  ? AnnotateObjectProps<T, S> & types.TypeOf<S['objectSchema']>
  : never

export interface AnnotateObjectProps<
  T extends types.ObjectType<any, any>,
  S extends AnySchema
> {
  //    [KeyWord.PROPERTIES]: {
  //    $super?: AnnotateObject<any, any, S >,// /*{[P in keyof T["superType"]]: Annotation<T["superType"][P], S>},*/ AnnotateObject<T["superType"], S>,
  $props: {
    [P in keyof T['interfaceDecl']]: Annotation<T['interfaceDecl'][P], S>
  }
}

export interface AnnotateSubtypeProps<
  T extends types.Subtype<any, any, any>,
  S extends AnySchema
> {
  $super: { [key: string]: any } // {[P in keyof T["superProps"]]: Annotation<T["superProps"][P], S>} & types.TypeOf<S["objectSchema"]>, //Annotation<T["superType"], S>, //

  $props: {
    [K in keyof T['extraProps']]: Annotation<T['extraProps'][K], S> // & types.TypeOf<S["objectSchema"]>
  }
}

/*
export type AnnotateUnion<T, S extends AnySchema> =
    T extends types.UnionType<Array<t.Any>>? AnnotateUnionElements<T["baseType"], S> & types.TypeOf<S["unionSchema"]>: never
export type AnnotateUnionElements<T, S extends AnySchema> =
    T extends Array<any>? {/!*[KeyWord.UNION]*!/ $union:Annotation<T[number], S>[]} : never
*/

export type AnnotateTaggedUnion<
  T,
  S extends AnySchema
> = T extends types.TaggedUnionType<any>
  ? AnnotateUnionTaggedElemnets<T, S> & types.TypeOf<S['taggedUnionSchema']>
  : never

export interface AnnotateUnionTaggedElemnets<
  T extends types.TaggedUnionType<any>,
  S extends AnySchema
> {
  /*[KeyWord.UNION]*/ $union: {
    [P in keyof T['elements']]: Annotation<T['elements'][P], S>
  }
}

/*
export type AnnotateIntersection<T, S extends AnySchema> =
    T extends types.IntersectionType<Array<t.Any>>? AnnotateIntersectionElements<T["baseType"], S> & types.TypeOf<S["intersectionSchema"]>: never
export type AnnotateIntersectionElements<T, S extends AnySchema> =
    T extends Array<any>? {/!*[KeyWord.INTERSECTION]*!/ $intersection:Annotation<T[number], S>[]} : never
*/

export type AnnotateArray<T, S extends AnySchema> = T extends types.ArrayType<any>
  ? AnnotateElem<T['element'], S> & types.TypeOf<S['arraySchema']>
  : never
export interface AnnotateElem<
  T extends types.Type<any, any, any>,
  S extends AnySchema
> {
  /*[KeyWord.ELEMENT]*/ $elem: Annotation<T, S> | 'infer'
}

/*
export type AnnotateMap<T, S extends AnySchema> =
    T extends types.MapType<any, any>? AnnotateMapElements<T, S> & types.TypeOf<S["mapSchema"]> : never
export interface AnnotateMapElements<T extends types.MapType<any, any>, S extends AnySchema>  {
    /!*[KeyWord.KEY]*!/ $key:Annotation<T["keyType"], S>, /!*[KeyWord.VALUE]*!/ $value: Annotation<T["baseType"], S>
}
*/

export type AnnotateSimple<T, S extends AnySchema> =  // T extends SimpleTypeC<any> ? types.TypeOf<S["simple"]> : never
  | AnnotateLiteral<T, S>
  | AnnotateNumber<T, S>
  | AnnotateString<T, S>
  | AnnotateBoolean<T, S>
  | AnnotateDate<T, S>

export type AnnotateLiteral<T, S extends AnySchema> = T extends types.LiteralType<any>
  ? types.TypeOf<S['simpleSchema']>
  : never
export type AnnotateNumber<T, S extends AnySchema> = T extends types.NumberType
  ? types.TypeOf<S['simpleSchema']>
  : never
export type AnnotateString<T, S extends AnySchema> = T extends types.StringType
  ? types.TypeOf<S['simpleSchema']>
  : never
export type AnnotateBoolean<T, S extends AnySchema> = T extends types.BooleanType
  ? types.TypeOf<S['simpleSchema']>
  : never
export type AnnotateDate<T, S extends AnySchema> = T extends types.DateType
  ? types.TypeOf<S['simpleSchema']>
  : never
