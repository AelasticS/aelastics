import * as t from "aelastics-types"
import type { AnnotationTypes as a } from "aelastics-types"


export const JSX_Types = t.schema("JSX_Types")

export const SimpleJSXAnnotType = t.object({
  include: t.boolean
}, 'simple JSX Annot Schema', JSX_Types)


export const PropertyJSXAnnotType = t.object({
  propName: t.optionalString,  // if undefined, name of the property is used
  isParentProp: t.optionalBoolean, // if undefined, the property is in the parent
  isReconnectAllowed: t.optionalBoolean, //if undefined, reconnection is allowed
  textContentAllowed:t.optionalBoolean, 
  textPropName: t.optionalString       //assign text content to this property, if text allowed
}, 'array JSX Annot Schema', JSX_Types)

export const ObjectJSXAnnotType = t.object({
  tagName: t.optionalString,  // if undefined, name of the type is used
  nameProp: t.string,     // property used as name of object
  idProp: t.string,        // property used as id of object
  isReference: t.optionalBoolean, // should object be a reference JSX element
  refType: t.optional(t.string.derive().oneOf(["", "refByID", "refByName"])), // how to reference object
  ifProperty:t.optional(PropertyJSXAnnotType) // annotation if Object is a property
}, 'object JSX Annot Schema', JSX_Types)



export type JSX_AnnotationType = a.AnnotationSchema<
  typeof SimpleJSXAnnotType,
  typeof ObjectJSXAnnotType,
  typeof PropertyJSXAnnotType
>

export type JSX_Annotation<T extends t.ObjectType<any, any>> = a.Annotation<T, JSX_AnnotationType>

export type Typed_JSX_Annotation<T extends t.ObjectType<any, any>> = {
  type:T
  value: a.Annotation<T, JSX_AnnotationType>
}

export type ISimpleJSXAnnotType = t.TypeOf<typeof SimpleJSXAnnotType>
export type IPropertyJSXAnnotType = t.TypeOf<typeof PropertyJSXAnnotType>
export type IObjectJSXAnnotType = t.TypeOf<typeof ObjectJSXAnnotType>

