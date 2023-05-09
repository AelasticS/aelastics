import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel";

//TODO: insted of model element name define another property for names of M2T_Item, DocElement
//TODO: real solution is to designate folder and other containers as namespaces

export const M2T_Schema = t.schema("M2T_Schema");

export const M2T_Item = t.subtype(ModelElement, {
}, "FS_Item", M2T_Schema);

export const M2T_Model = t.subtype(Model, {
    items: t.arrayOf(M2T_Item)
}, "FS_Model", M2T_Schema);

export const Directory = t.subtype(M2T_Item, {
    items:t.arrayOf(M2T_Item, "items"),
}, "Directory", M2T_Schema);

export const DocElement = t.subtype(ModelElement, {    
    parentDocument: t.optional(t.link(M2T_Schema, 'Document'), 'parentDocument'),
    parentSection: t.optional(t.link(M2T_Schema, 'Section'), 'parentSection')
}, "DocElement", M2T_Schema);

export const Document = t.subtype(M2T_Item, {
    elements:t.arrayOf(DocElement, "elementsOfDocument"),
}, "Document", M2T_Schema);

export const Paragraph = t.subtype(DocElement, {
    txtContent:t.string,
}, "Paragraph", M2T_Schema);

export const Section = t.subtype(DocElement, {
    elements:t.arrayOf(DocElement, "elementsOfSection"),
}, "Section", M2T_Schema);

t.inverseProps(Document, 'elements', DocElement, 'parentDocument');
t.inverseProps(Section, 'elements', DocElement, 'parentSection');

export type M2T_Model = t.TypeOf<typeof M2T_Model>
export type IM2T_Item = t.TypeOf<typeof M2T_Item>
export type IDirectory = t.TypeOf<typeof Directory>
export type IDocument = t.TypeOf<typeof Document>
export type IDocElement = t.TypeOf<typeof DocElement>
export type IParagraph = t.TypeOf<typeof Paragraph>
export type ISection = t.TypeOf<typeof Section>


export const isDirectory = (input: IM2T_Item): input is IDirectory =>
  "items" in input;

export const isParagraph = (input: IDocElement): input is IParagraph =>
  "txtContent" in input;
