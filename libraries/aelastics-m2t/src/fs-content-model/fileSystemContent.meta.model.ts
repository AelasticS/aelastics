import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel";

export const FSC_Schema = t.schema("BPMN-Schema");

export const FS_Model = t.subtype(Model, {
}, "FS_Model", FSC_Schema);

export const FS_Item = t.subtype(ModelElement, {
}, "FS_Item", FSC_Schema);

export const Directory = t.subtype(FS_Item, {
    items:t.arrayOf(FS_Item, "items"),
}, "Directory", FSC_Schema);

export const File_Element = t.subtype(FS_Item, {
}, "FileElement", FSC_Schema);

export const Document = t.subtype(FS_Item, {
    elements:t.arrayOf(File_Element, "elements"),
}, "Document", FSC_Schema);

export const Paragraph = t.subtype(File_Element, {
    content:t.string,
}, "Paragraph", FSC_Schema);

export const Section = t.subtype(File_Element, {
    elements:t.arrayOf(File_Element, "elements"),
}, "Section", FSC_Schema);

export type IFS_Model = t.TypeOf<typeof FS_Model>
export type IDirectory = t.TypeOf<typeof Directory>
export type IDocument = t.TypeOf<typeof Document>
export type IParagraph = t.TypeOf<typeof Paragraph>
export type ISection = t.TypeOf<typeof Section>
