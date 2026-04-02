import * as wf from './workflow.meta'
import { CpxTemplate, ExprNode, Template, WithRefProps } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IModelProps = WithRefProps<wf.IWorkflowModel> & { store?: ModelStore }

export const WorkflowModel: CpxTemplate<IModelProps, wf.IWorkflowModel> = (props) => {
    return new ExprNode(wf.WorkflowModel, props, undefined)
}

export const Process: Template<wf.IProcess> = (props) => {
    return new ExprNode(wf.Process, props, 'processes')
}
export const SubProcess: Template<wf.IProcess> = (props) => {
    return new ExprNode(wf.Process, props, 'steps')
}

export const Flow: Template<wf.ISequence> = (props) => {
    return new ExprNode(wf.Sequence, props, 'flow')
}

export const Sequence: Template<wf.ISequence> = (props) => {
    return new ExprNode(wf.Sequence, props, 'steps')
}

export const Parallel: Template<wf.IParallel> = (props) => {
    return new ExprNode(wf.Parallel, props, 'steps')
}

export const Task: Template<wf.ITask> = (props) => {
    return new ExprNode(wf.Task, props, 'steps')
}
