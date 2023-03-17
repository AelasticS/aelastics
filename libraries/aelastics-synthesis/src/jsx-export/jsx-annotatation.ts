import * as t from "aelastics-types"
import type {AnnotationTypes as a} from "aelastics-types"

export const JSX_Types = t.schema("JSX_Types")
export const simpleJSXAnnotType = t.object({
     include: t.boolean 
    }, 'simple JSX Annot Schema', JSX_Types)


export const objectJSXAnnotType = t.object({
     tagName: t.optionalString,  // if undefined, name of the type is used
     nameProp: t.string,     // property used as name of object
     idProp: t.string        // property used as id of object
    }, 'object JSX Annot Schema', JSX_Types)


export const collectionJSXAnnotType = t.object({
  propName: t.optionalString,  // if undefined, name of the property is used
  isParentProp: t.optionalBoolean, // if undefined, the property is in the parent
  isReconnectAllowed: t.optionalBoolean, //if undefined, reconnection is allowed
 }, 'array JSX Annot Schema', JSX_Types)


export type JSX_AnnotationType = a.AnnotationSchema<
  typeof simpleJSXAnnotType,
  typeof objectJSXAnnotType,
  typeof collectionJSXAnnotType
>

export type JSX_Annotation<T> = a.Annotation<T, JSX_AnnotationType>

export type IsimpleJSXAnnotType = t.TypeOf<typeof simpleJSXAnnotType> 
export type IobjectJSXAnnotType = t.TypeOf<typeof objectJSXAnnotType> 
export type IcollectionJSXAnnotType = t.TypeOf<typeof collectionJSXAnnotType> 

