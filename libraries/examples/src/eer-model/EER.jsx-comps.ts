import * as e from './EER.meta.model.type'
import { CpxTemplate, ExprNode, Template, WithRefProps } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IModelProps = WithRefProps<e.IEERSchema> & { store?: ModelStore }

export const EERSchema: CpxTemplate<IModelProps, e.IEERSchema> = (props) => {
    return new ExprNode(e.EERSchema, props, undefined)
}

export const Kernel: Template<e.IKernel> = (props) => {
  return new ExprNode(e.Kernel, {objectClassification:"Kernel",  ...props}, undefined)
}

export const Weak: Template<e.IWeak> = (props) => {
  return new ExprNode(e.Weak, {objectClassification:"Weak",  ...props}, undefined)
}

export const Attribute: Template<e.IAttribute> = (props) => {
  return new ExprNode(e.Attribute, props, 'attributes')
}

export const Domain: Template<e.IDomain> = (props) => {
  return new ExprNode(e.Domain, props, 'attrDomain')
}


