import * as t from "aelastics-types"
import type {AnnotationTypes as a} from "aelastics-types"

const JSX_Types = t.schema("JSX_Types")
const simpleJSXAnnotSchema = t.object({
     include: t.boolean 
    }, 'simple JSX Annot Schema', JSX_Types)

const objectJSXAnnotSchema = t.object({
     tagName: t.optionalString,  // if undefined, name of the type is used
     nameProp: t.string,     // property used as name of object
     idProp: t.string        // property used as id of object
    }, 'object JSX Annot Schema', JSX_Types)

const collectionJSXAnnotSchema = t.object({
  propName: t.optionalString,  // if undefined, name of the property is used
  isParentProp: t.optionalBoolean, // if undefined, the property is in the parent
  isReconnectAllowed: t.optionalBoolean, //if undefined, reconnection is allowed
 }, 'array JSX Annot Schema', JSX_Types)


export type JSX_AnnotationSchema = a.AnnotationSchema<
  typeof simpleJSXAnnotSchema,
  typeof objectJSXAnnotSchema,
  typeof collectionJSXAnnotSchema
>

export type JSX_Annotation<T> = a.Annotation<T, JSX_AnnotationSchema>


