/*
 * Copyright (c) AelasticS 2019.
 *
 */


import * as t from "aelastics-types";
import { IDType, NameType } from "./basic.type";

export const keyType = t.number;
export const nodeCategories = t.string.derive().oneOf(['entity.independent', 'entity.dependent', 'specialisation.partial', 'specialisation.full'])
export const linkCategories = t.string.derive().oneOf(['regular', 'denpending', 'specialisation'])



export const DiagramSchema = t.schema('DiagramSchema')

export const DiagramPart = t.entity({
    id: IDType,
    key: keyType,

    modelElementId: t.optional(IDType),

}, ['id'] as const,
    "DiagramPart", DiagramSchema);

export const DiagramNodeAttribute = t.object({
    name: t.string,
    selected: t.boolean
}, 'DiagramNodeAttribute', DiagramSchema)

export const DiagramNode = t.subtype(DiagramPart, {
    location: t.string,
    text: t.string,
    width: t.number.derive().greaterThanOrEqual(20),
    height: t.number.derive().greaterThanOrEqual(15),
    category: nodeCategories,
    font: t.optional(t.string),
    isUnderline: t.boolean,
    keys: t.arrayOf(DiagramNodeAttribute),
    attributes: t.arrayOf(DiagramNodeAttribute)
}, 'DiagramNode', DiagramSchema)

export const DiagramLink = t.subtype(DiagramPart, {
    from: keyType,
    to: keyType,
    category: linkCategories,
    fromCardinality: t.string,
    toCardinality: t.string,
    fromDirection: t.string,
    toDirection: t.string,


}, 'DiagramLink', DiagramSchema)

export const Diagram = t.subtype(DiagramPart, {
    text: NameType,

    nodeDataArray: t.arrayOf(DiagramNode),
    hasGrid: t.boolean,
    linkDataArray: t.arrayOf(DiagramLink)
}, "Diagram", DiagramSchema);


export type IDiagramPart = t.TypeOf<typeof DiagramPart>
export type IDiagram = t.TypeOf<typeof Diagram>
export type IDiagramNode = t.TypeOf<typeof DiagramNode>
export type IDiagramLink = t.TypeOf<typeof DiagramLink>
export type IDiagramNodeAttribute = t.TypeOf<typeof DiagramNodeAttribute>
export type INodeCategories = t.TypeOf<typeof nodeCategories>;
export type ILinkCategories = t.TypeOf<typeof linkCategories>;
