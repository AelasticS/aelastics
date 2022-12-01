import * as bpmn from './BPM.meta.model.type'
import { CpxTemplate, Element, Template, WithRefProps } from '../../jsx/element'
import { ModelStore } from '../../jsx/ModelsStore'

export type IModelProps = WithRefProps<bpmn.IProcess> & { store?: ModelStore }

export const Process: CpxTemplate<IModelProps, bpmn.IProcess> = (props) => {
    return new Element(bpmn.Process, props, undefined)
}

export const Document: Template<bpmn.IDocument> = (props) => {
    return new Element(bpmn.Document, props, 'children')
}

export const InputDocument: Template<bpmn.IDocument> = (props) => {
    return new Element(bpmn.Document, props, 'inputs')
}

export const OutputDocument: Template<bpmn.IDocument> = (props) => {
    return new Element(bpmn.Document, props, 'outputs')
}

export const Role: Template<bpmn.IRole> = (props) => {
    return new Element(bpmn.Role, props, 'roles')
}

export const Task: Template<bpmn.ITask> = (props) => {
    return new Element(bpmn.Task, props, 'children')
}

export const SubProcess: Template<bpmn.ISubProcess> = (props) => {
    return new Element(bpmn.SubProcess, props, 'children')
}

export const Parallel: Template<bpmn.IParallel> = (props) => {
    return new Element(bpmn.Parallel, props, 'children')
}

export const Sequence: Template<bpmn.ISequence> = (props) => {
    return new Element(bpmn.Sequence, props, 'children')
}

export const Switch: Template<bpmn.ISwitch> = (props) => {
    return new Element(bpmn.Switch, props, 'children')
}

export const Case: Template<bpmn.ICase> = (props) => {
    return new Element(bpmn.Case, props, 'children')
}



