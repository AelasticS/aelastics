import * as f from './fileSystemContent.meta.model'
import { CpxTemplate, Element, Template, WithRefProps } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IFS_ModelProps = WithRefProps<f.IFS_Model> & { store?: ModelStore }

export const FileModel: CpxTemplate<IFS_ModelProps, f.IFS_Model> = (props) => {
    return new Element(f.FS_Model, props, undefined)
}

export const Dir: Template<f.IDirectory> = (props) => {
    return new Element(f.Directory, props, 'items')
}

export const Doc: Template<f.IDocument> = (props) => {
    return new Element(f.Document, props, 'items')
}

export const P: Template<f.IParagraph> = (props) => {
    return new Element(f.Paragraph, props, 'elements')
}

export const Sec: Template<f.ISection> = (props) => {
    return new Element(f.Section, props, 'elements')
}