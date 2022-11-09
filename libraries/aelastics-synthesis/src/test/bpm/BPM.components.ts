import * as bpmn from './BPM.meta.model.type'
import { STX, Instance } from '../../jsx/handle'

export type INodeProps = Partial<bpmn.INode> & STX.InstanceProps
export type IProcessProps = Partial<bpmn.IProcess> & STX.InstanceProps
export type IDocumentProps = Partial<bpmn.IDocument> & STX.InstanceProps
export type IRoleProps = Partial<bpmn.IRole> & STX.InstanceProps
export type ITaskProps = Partial<bpmn.ITask> & STX.InstanceProps
export type ISubProcessProps = Partial<bpmn.ISubProcess> & STX.InstanceProps


export type IParallelProps = Partial<bpmn.IParallel> & STX.InstanceProps
export type ISequenceProps = Partial<bpmn.ISequence> & STX.InstanceProps
export type ISwitchProps = Partial<bpmn.ISwitch> & STX.InstanceProps
export type ICaseProps = Partial<bpmn.ICase> & STX.InstanceProps

const cnGen = (prop:string) => (parent:Instance, child:Instance) => {
    child[prop] = parent
}

const cnNodes = STX.createConnectFun({
    childPropName:"parent",
    childPropType:'Object',
    parentPropName:"children",
    parentPropType:'Array'
})

const cnInputDoc = STX.createConnectFun({
    childPropName:"inputIn",
    childPropType:'Array',
    parentPropName:"inputs",
    parentPropType:'Array'
})

const cnOutputDoc = STX.createConnectFun({
    childPropName:"outputIn",
    childPropType:'Array',
    parentPropName:"outputs",
    parentPropType:'Array'
})


export const Document: STX.Template<IDocumentProps, bpmn.IDocument> = (props, store) => {
    return STX.createChild(bpmn.Document, props, cnNodes, store)
}
export const InputDocument: STX.Template<IDocumentProps, bpmn.IDocument> = (props, store) => {
    return STX.createChild(bpmn.Document, props, cnInputDoc, store)
}
export const OutputDocument: STX.Template<IDocumentProps, bpmn.IDocument> = (props, store) => {
    return STX.createChild(bpmn.Document, props, cnOutputDoc, store)
}

export const Process: STX.Template<IProcessProps, bpmn.IProcess> = (props, store) => {
    return STX.createChild(bpmn.Process, props, cnNodes, store) 
}

export const Role: STX.Template<IRoleProps, bpmn.IRole> = (props, store) => {
    return STX.createChild(bpmn.Role, props, cnNodes, store)
}

export const Task: STX.Template<ITaskProps, bpmn.ITask> = (props, store) => {
    return STX.createChild(bpmn.Task, props, cnNodes, store) 
}

export const SubProcess: STX.Template<ISubProcessProps, bpmn.ISubProcess> = (props, store) => {
    return STX.createChild(bpmn.SubProcess, props, cnNodes, store)
}

export const Parallel: STX.Template<IParallelProps, bpmn.IParallel> = (props, store) => {
    return STX.createChild(bpmn.Parallel, props, cnNodes, store) 
}

export const Sequence: STX.Template<ISequenceProps, bpmn.ISequence> = (props, store) => {
    return STX.createChild(bpmn.Sequence, props, cnNodes, store) 
}

export const Switch: STX.Template<ISwitchProps, bpmn.ISwitch> = (props, store) => {
    return STX.createChild(bpmn.Switch, props, cnNodes, store) 
}
export const Case: STX.Template<ICaseProps, bpmn.ICase> = (props, store) => {
    return STX.createChild(bpmn.Case, props, cnNodes, store)
}


