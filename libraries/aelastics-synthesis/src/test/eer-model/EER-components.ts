import * as e from './EER.meta.model.type'
import { CpxTemplate, Element, Template, WithRefProps } from '../../jsx/element'
import { ModelStore } from '../../jsx/ModelsStore'

export type IModelProps = WithRefProps<e.IEERSchema> & { store?: ModelStore }

export const EERSchema: CpxTemplate<IModelProps, e.IEERSchema> = (props) => {
    return new Element(e.EERSchema, props, undefined)
}

export const Kernel: Template<e.IKernel> = (props) => {
  return new Element(e.Kernel, {objectClassification:"Kernel",  ...props}, undefined)
}

export const Attribute: Template<e.IAttribute> = (props) => {
  return new Element(e.Attribute, props, 'attributes')
}

export const Domain: Template<e.IDomain> = (props) => {
  return new Element(e.Domain, props, 'attrDomain')
}


