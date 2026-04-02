/** @jsx createExprNode */
// /*
//  * Copyright (c) AelasticS 2022.
//  */

import { createExprNode, Template } from "aelastics-synthesis"
import * as t from "aelastics-types"
import { Process, Sequence, Task, Parallel, WorkflowModel, SubProcess } from "./workflow.jsx-comps"
import { IProcess, ISequence, ITask, IWorkflowModel } from "./workflow.meta"
import { dep1 } from "../Organization/example-department"
import { IOrganization } from "../Organization/organization.model.type"
import { ModelStore } from "aelastics-synthesis"
import { ExprNode } from "aelastics-synthesis"

const processName = "DocumentApproval"
const approverCount = 2

export const Approval =
    <WorkflowModel name="SimpleApproval">
        <Process name="Publishing">
            <Sequence>
                <Task name="Format" />
                <Task name="Publish" />
            </Sequence>
        </Process>
        <Process name={processName}>
            <Sequence>
                <Task name="Write proposal" />
                <Parallel name="reviews">
                    {Array.from({ length: approverCount }, (_, i) =>
                        <Task name={`Approve ${i + 1}`} />
                    )}
                </Parallel>
                < SubProcess $refByName="Publishing" />
            </Sequence>
        </Process>
    </WorkflowModel>


export type IApprovalConfig = {
    document: string
    approvers: number
    mode?: "parallel" | "sequential"
}


export const ConfigurableApproval = ({ document, approvers, mode }: IApprovalConfig) => {
    const tasks = new Array(approvers).map((_, i) => <Task name={`${document}Approval-${i}`} />)
    return (<WorkflowModel name={`ApprovalWF-${document}`}>
        <Process name={`Approve ${document}`}>
            <Sequence>
                <Task name={`Write ${document}`} />
                {mode === "parallel"
                    ? <Parallel> {tasks} </Parallel>
                    : <Sequence> {tasks} </Sequence>}
            </Sequence>
        </Process>
    </WorkflowModel>)
}

const ContractApproval = <ConfigurableApproval document="Contract" approvers={3} mode="parallel" />

const store = new ModelStore()
const contractApprovalModel = store.render(ContractApproval)

export const GenericApproval = (WorkerTask: Template<ITask>) =>
    (c: IApprovalConfig) => {
        const tasks = new Array(c.approvers)
            .map((_, i) => <Task name={`${c.document}Approval-${i}`} />)
        return (
            <WorkflowModel name={`ApprovalWF-${c.document}`}>
                <Process name={`Approve ${c.document}`}>
                    <Sequence>
                        <WorkerTask name={`Write ${c.document}`} />
                        {c.mode === "parallel"
                            ? <Parallel> {tasks} </Parallel>
                            : <Sequence> {tasks} </Sequence>}
                    </Sequence>
                </Process>
            </WorkflowModel>
        )
    }

const TwoStepWrite: Template<ITask> = ({ name }) => (
    <Sequence>
        <Task name={`${name}-draft`} />
        <Task name={`${name}-final`} />
    </Sequence>
)

const TwoStepApproval = GenericApproval(TwoStepWrite)

const contractTwoStep = (
    <TwoStepApproval document="Contract" approvers={2} mode="parallel" />
)
const contractTwoStepModel = store.render(contractTwoStep)

/*
    
export const GenericApproval = (WorkerTaskFactory: (c:IApprovalConfiguration) => Template<ITask>) => (c:IApprovalConfiguration) => {
    const WorkerTask = WorkerTaskFactory(c);
    // create approval tasks
    const tasks = new Array(c.approvers).map((_, i) => <Task name={`approval ${i}`} />);
    return (
      <Sequence>
        <WorkerTask />
        {c.isParallel ? <Parallel> {tasks} </Parallel>
                    : <Sequence> {tasks} </Sequence>
        }
      </Sequence>
    );
  };

const GroupWork = (c: IApprovalConfiguration): Template<ITask> => () =>
  <Sequence>
    <Task name={`${c.processName}-T1 (approvers: ${c.approvers})`} />
    <Parallel>
        <Task name="T2"/>
        <Task name="T3"/>
    </Parallel>
  </Sequence>

const GenericGroupWorkApproval = GenericApproval(GroupWork)

const myGroupWorkApproval = <GenericGroupWorkApproval 
            processName="myGroupWorkApproval"
            approvers={2}
            isParallel={true}
    />

    */

