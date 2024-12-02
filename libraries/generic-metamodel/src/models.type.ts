/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as t from "aelastics-types"
import { Diagram } from "./diagram.type";
import { IDType, NameType, DescriptionType } from "./basic.type";
import { RepositoryObject } from "./repository.type";

export const ModelSchema = t.schema("RepModelSchema");

//TODO: change id type


export const ModelElement = t.subtype(RepositoryObject,{
    // name must be RegExp("^[a-zA-Z0-9_.-]+$")
    path: t.optional(t.string),
    // label is logically same as name, but can it be consisting of several words (and shown in multiple lines)
    // label is shown and entered in UI; name is computed from label by removing all extra spaces and newlines
    label: t.string,
    content: t.string.derive('max_65535').maxLength(65535),
    parentModel: t.optional(t.link(ModelSchema, 'Model')), // to be defined as Ref
    namespace: t.optional(t.link(ModelSchema, 'Namespace')) // to be defined as Ref
},  "ModelElement", ModelSchema);

export const Namespace = t.subtype(ModelElement, {
    elements: t.arrayOf(ModelElement)
}, "Namespace", ModelSchema);


// TODO: add "status" property: Draft, Valid, Approved, Published, Archieved
export const Model = t.subtype(Namespace, {
    MDA_level: t.optional(t.string.derive().oneOf(['M0', 'M1', 'M2', 'M3'])),
    diagrams: t.arrayOf(Diagram),
}, "Model", ModelSchema);

// TODO: make parentModel and namespace to be reference type
t.inverseProps(ModelElement, 'parentModel', Model, 'elements')

export type IModelElement = t.TypeOf<typeof ModelElement>
export type INamespace = t.TypeOf<typeof Namespace>
export type IModel = t.TypeOf<typeof Model>
