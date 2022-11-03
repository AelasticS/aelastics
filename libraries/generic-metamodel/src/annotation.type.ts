import * as t from "aelastics-types"
import {ModelElement, Model} from "./models.type"

export const AnnotationTypeSchema = t.schema("AnnotationTypeSchema");

// meta level
export const AnnotationElementSchema = t.subtype(ModelElement, {
    structure: t.string, // ModelElement from some Schema e.g.structure = t.string.oneOf("surogat", "FK")
    type: ModelElement // e.g. "Weak", "Relationship", "Entity"
}, "AnnotationSchema", AnnotationTypeSchema);

export const AnnotationSchema = t.subtype(Model, {
    elements: t.arrayOf(AnnotationElementSchema),
    annotatatedMetaModel:Model // e.g. "EER meta-model"
}, "AnnotationSchema", AnnotationTypeSchema);

// instance level
export const Annotation = t.subtype(ModelElement, {
    instanceOf:AnnotationElementSchema,
    annotatatedElement: ModelElement,  // e.g. "Person", "Child", "Children"
    value:t.string  // e.g. for Child it could be "surogat" 
}, "AnnotationSchema", AnnotationTypeSchema);

export const AnnotationModel = t.subtype(Model, {
    instanceOf:AnnotationSchema,
    annotatatedModel:Model,   // e.g. "Workers"
    elements: t.arrayOf(Annotation)
}, "AnnotationSchema", AnnotationTypeSchema);

// TODO: add Feature Models and configurations independantly from Annotation Schemas
