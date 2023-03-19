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

export const DocElement = t.subtype(ModelElement, {
}, "DocElement", FSC_Schema);

export const Document = t.subtype(FS_Item, {
    elements:t.arrayOf(DocElement, "elementsOfDocument"),
}, "Document", FSC_Schema);

export const Paragraph = t.subtype(DocElement, {
    txtContent:t.string,
}, "Paragraph", FSC_Schema);

export const Section = t.subtype(DocElement, {
    elements:t.arrayOf(DocElement, "elementsOfSection"),
}, "Section", FSC_Schema);

export type IFS_Model = t.TypeOf<typeof FS_Model>
export type IDirectory = t.TypeOf<typeof Directory>
export type IDocument = t.TypeOf<typeof Document>
export type IDocElement = t.TypeOf<typeof DocElement>
export type IParagraph = t.TypeOf<typeof Paragraph>
export type ISection = t.TypeOf<typeof Section>


export const isDirectory = (input: IDocElement): input is IDirectory =>
  "items" in input;

export const isParagraph = (input: IDocElement): input is IParagraph =>
  "txtContent" in input;
