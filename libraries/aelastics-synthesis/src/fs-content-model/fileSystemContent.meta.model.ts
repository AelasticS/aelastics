import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel";

export const FSC_Schema = t.schema("BPMN-Schema");

export const FS_Item = t.subtype(ModelElement, {


}, "FS_Item", FSC_Schema);

export const Directory = t.subtype(FS_Item, {
    items:t.arrayOf(FS_Item, "items"),
}, "Directory", FSC_Schema);

export const FileElement = t.subtype(FS_Item, {
}, "FileElement", FSC_Schema);

export const File = t.subtype(FS_Item, {
    content:t.arrayOf(FileElement, "content"),
}, "File", FSC_Schema);

export const Paragraph = t.subtype(FileElement, {
    content:t.arrayOf(FileElement, "content"),
}, "Paragraph", FSC_Schema);

export const Section = t.subtype(FileElement, {
    content:t.arrayOf(FileElement, "content"),
}, "Section", FSC_Schema);

export type IDirectory = t.TypeOf<typeof Directory>
export type IFile = t.TypeOf<typeof File>
export type IParagraph = t.TypeOf<typeof Paragraph>
export type ISection = t.TypeOf<typeof Section>
