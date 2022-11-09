import * as e from './EER.meta.model.type'
import { STX } from '../../jsx/handle'
import { IModel } from 'generic-metamodel'

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

export const EERSchema: STX.Template<IEERSchemaProps, e.IEERSchema> = (props, store, model) => {
  return STX.createChild(e.EERSchema, props, STX.createConnectFun({}, model), store)
}

export const Kernel: STX.Template<IKernelProps, e.IKernel> = (props, store, model) => {
  return STX.createChild(e.Kernel, props, STX.createConnectFun({}, model), store)
}

export const Attribute: STX.Template<IAttributeProps, e.IAttribute> = (props,store, model) => {
  return STX.createChild(e.Attribute, props, STX.createConnectFun({
    parentPropName:"attributes", parentPropType:'Array',
    childPropName:"attrEntity", childPropType:'Object'
  }, model), store)
}

export const Domain: STX.Template<IDomainProps, e.IDomain> = (props,store, model) => {
  return STX.createChild(e.Domain, props, STX.createConnectFun({
    parentPropName:"attrDomain", parentPropType:'Object'
   // childPropName:"", childPropType:'Array'
  }, model), store)
}


export interface EERComps {
  Kernel: STX.Template<IKernelProps, e.IKernel>
}

export const sinisa:EERComps = {
  Kernel: (props:IKernelProps, store:any, model:any) => {
    return STX.createChild(e.Kernel, props, STX.createConnectFun({}, model), store)
  }
}


export const getEER = (model:IModel, store: any):EERComps => ({
  Kernel: (props:IKernelProps, store:any, model:any) => {
    return STX.createChild(e.Kernel, props, STX.createConnectFun({}, model), store)
  }
})