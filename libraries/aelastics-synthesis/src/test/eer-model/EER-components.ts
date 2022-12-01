import * as e from './EER.meta.model.type'
import { STX } from '../../jsx/handle'
import { CpxTemplate, Element, Template, WithRefProps } from '../../jsx2/element'
import { ModelStore } from '../../jsx2/ModelsStore'

export interface IModelElementProps extends STX.InstanceProps {
  name: string
}

export type IEERSchemaProps = Partial<e.IEERSchema> & STX.InstanceProps
export type IKernelProps = Partial<e.IKernel> & STX.InstanceProps
export type IDomainProps = Partial<e.IDomain> & STX.InstanceProps
export type IAttributeProps = Partial<e.IAttribute> & STX.InstanceProps
export interface IAttributeChildren extends IModelElementProps {
  domain: IDomainProps
}


const cnNodes = STX.createConnectFun({
  childPropName:"parent",
  childPropType:'Object',
  parentPropName:"children",
  parentPropType:'Array'
})

// export const EERSchema: Template<e.IEERSchema> = (props) => {
//   return new Element(e.EERSchema, props, undefined)
// }

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


