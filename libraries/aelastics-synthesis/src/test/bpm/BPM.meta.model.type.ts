import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel";

export const BPM_Schema = t.schema("BPMN-Schema");

export const Node = t.subtype(ModelElement, {
    children:t.arrayOf(t.link(BPM_Schema, "Node")),
    parent:t.link(BPM_Schema, "Node")

}, "Node", BPM_Schema);
export const Role = t.subtype(ModelElement, {}, "Role", BPM_Schema);

export const Process = t.subtype(Model, {
    roles:t.arrayOf(Role)
}, "Process", BPM_Schema);

export const Task = t.subtype(Node, {
    activity:t.string,
    worker:t.optional(Role),
    inputs:t.arrayOf(t.link(BPM_Schema, "Document)")),
    outputs:t.arrayOf(t.link(BPM_Schema, "Document)")),
}, "Task", BPM_Schema);
export const SubProcess = t.subtype(Task, {
    process:Process
}, "SubProcess", BPM_Schema);

export const Parallel = t.subtype(Node, {}, "Parallel", BPM_Schema);
export const Sequence = t.subtype(Node, {}, "Sequence", BPM_Schema);
export const Switch = t.subtype(Node, {}, "Switch", BPM_Schema);
export const Case = t.subtype(Node, {}, "Case", BPM_Schema);

export const Document = t.subtype(Node, {
    docSchema:t.string,
    inputIn:t.arrayOf(Task),
    outpuIn:t.arrayOf(Task)
}, "Document", BPM_Schema);

export type INode = t.TypeOf<typeof Node>
export type IProcess = t.TypeOf<typeof Process>
export type ITask = t.TypeOf<typeof Task>
export type ISubProcess = t.TypeOf<typeof SubProcess>

export type IParallel = t.TypeOf<typeof Parallel>
export type ISequence = t.TypeOf<typeof Sequence>
export type ISwitch = t.TypeOf<typeof Switch>
export type ICase = t.TypeOf<typeof Case>

export type IDocument = t.TypeOf<typeof Document>
export type IRole = t.TypeOf<typeof Role>

