import * as wf from './workflow.meta'
import { CpxTemplate, Element, Template, WithRefProps } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IModelProps = WithRefProps<wf.IWorkflowModel> & { store?: ModelStore }

export const WorkflowModel: CpxTemplate<IModelProps, wf.IWorkflowModel> = (props) => {
    return new Element(wf.WorkflowModel, props, undefined)
}

export const Process: Template<wf.IProcess> = (props) => {
    return new Element(wf.Process, props, 'processes')
}
export const SubProcess: Template<wf.IProcess> = (props) => {
    return new Element(wf.Process, props, 'steps')
}

export const Flow: Template<wf.ISequence> = (props) => {
    return new Element(wf.Sequence, props, 'flow')
}

export const Sequence: Template<wf.ISequence> = (props) => {
    return new Element(wf.Sequence, props, 'steps')
}

export const Parallel: Template<wf.IParallel> = (props) => {
    return new Element(wf.Parallel, props, 'steps')
}

export const Task: Template<wf.ITask> = (props) => {
    return new Element(wf.Task, props, 'steps')
}
