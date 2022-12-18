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
    // name must be proper alphanumeric
    // label is logically same as name, but can it be consisting of several words (and shown in multiple lines)
    // label is shown and entered in UI; name is computed from label by removing all extra spaces and newlines
    label: t.string,
    content: t.string.derive('65535').maxLength(65535),
    parentModel: t.optional(t.link(ModelSchema, 'Model')) // to be defined
},  "ModelElement", ModelSchema);

export const Namespace = t.subtype(ModelElement, {
    elements: t.arrayOf(ModelElement)
}, "Model", ModelSchema);


export const Model = t.subtype(Namespace, {
    MDA_level: t.optional(t.string.derive().oneOf(['M0', 'M1', 'M2', 'M3'])),
    diagrams: t.arrayOf(Diagram),
}, "Model", ModelSchema);

t.inverseProps(ModelElement, 'parentModel', Model, 'elements')

export type IModelElement = t.TypeOf<typeof ModelElement>
export type INamespace = t.TypeOf<typeof Namespace>
export type IModel = t.TypeOf<typeof Model>
