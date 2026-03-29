import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel"

export const WF_Schema = t.schema("Workflow-Schema")

export const Step = t.subtype(ModelElement, {}, "Step", WF_Schema)

export const Task = t.subtype(Step, {
    performer: t.optional(t.string),
}, "Task", WF_Schema)

export const Sequence = t.subtype(Step, {
    steps: t.arrayOf(Step),
}, "Sequence", WF_Schema)

export const Parallel = t.subtype(Step, {
    steps: t.arrayOf(Step),
}, "Parallel", WF_Schema)

export const Process = t.subtype(Step, {
    flow: Step,
}, "Process", WF_Schema)

export const WorkflowModel = t.subtype(Model, {
    processes: t.arrayOf(Process),
}, "WorkflowModel", WF_Schema)

export type IStep = t.TypeOf<typeof Step>
export type ITask = t.TypeOf<typeof Task>
export type ISequence = t.TypeOf<typeof Sequence>
export type IParallel = t.TypeOf<typeof Parallel>
export type IProcess = t.TypeOf<typeof Process>
export type IWorkflowModel = t.TypeOf<typeof WorkflowModel>
