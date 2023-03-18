import * as f from './fileSystemContent.meta.model'
import { CpxTemplate, Element, Template, WithRefProps } from '../index'
import { ModelStore } from '../index'

export type IFS_ModelProps = WithRefProps<f.IFS_Model> & { store?: ModelStore }

export const FileModel: CpxTemplate<IFS_ModelProps, f.IFS_Model> = (props) => {
    return new Element(f.FS_Model, props, undefined)
}

export const Dir: Template<f.IDirectory> = (props) => {
    return new Element(f.Directory, props, 'children')
}

export const File: Template<f.IFile> = (props) => {
    return new Element(f.File, props, 'children')
}

export const P: Template<f.IParagraph> = (props) => {
    return new Element(f.Paragraph, props, 'children')
}

export const S: Template<f.ISection> = (props) => {
    return new Element(f.Section, props, 'children')
}