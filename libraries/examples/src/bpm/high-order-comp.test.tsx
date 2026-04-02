/** @jsx createExprNode */
// /*
//  * Copyright (c) AelasticS 2022.
//  */

import { createExprNode, Template } from "aelastics-synthesis"
import * as t from "aelastics-types"
import { Process, Sequence, Task, Document, OutputDocument, InputDocument, Parallel } from "./BPM.jsx-comps"
import { IProcess, ISequence, ITask } from "./BPM.meta.model.type"
import { dep1 } from "../Organization/example-department"
import { IOrganization } from "../Organization/organization.model.type"
import { ModelStore } from "aelastics-synthesis"
import { ExprNode } from "aelastics-synthesis"

export const StaticApproval: IProcess = (
  <Process name="Approval">
    <Sequence>
      <Task name="Write proposal" />
      <Task name="Approve proposal" />
    </Sequence>
  </Process>
)


export type IApprovalConfig = {
  document: string
  howManyApprovers: number
  isParallel?: boolean
}

export const DynamicApproval = ({ document, howManyApprovers }: IApprovalConfig) => {
  return (
    <Process name={`Approve ${document}`}>
      <Sequence>
        <Task name={`Write ${document}`} />
        <Parallel>
          {
            // create parallel approval tasks
            new Array(howManyApprovers)
              .map((_, i) => (<Task name={`${document}Approval-${i}`} />))
          }
        </Parallel>
      </Sequence>
    </Process>
  )
}

const myDynamicApproval: IProcess = <DynamicApproval document="My Approval" howManyApprovers={3} />

export const MoreDynamicApproval = ({ document, isParallel, howManyApprovers }: IApprovalConfig) => {
  // create approval tasks
  const tasks = new Array(howManyApprovers).map((_, i) => <Task name={`${document}Approval-${i}`} />)
  return (
    <Process name={`Approve ${document}`}>
      <Sequence>
        <Task name={`Write ${document}`} />
        {isParallel ? <Parallel> {tasks} </Parallel> : <Sequence> {tasks} </Sequence>}
      </Sequence>
    </Process>
  )
}

const myModel: IProcess = <MoreDynamicApproval document="Approval" isParallel={false} howManyApprovers={3} />

export const GenericApproval = (WorkerTask: Template<ITask>) => (c: IApprovalConfig) => {
  // create approval tasks
  const tasks = new Array(c.howManyApprovers).map((_, i) => <Task name={`${c.document}Approval-${i}`} />)
  return (
    <Sequence>
      <WorkerTask name={`Write ${c.document}`} />
      {c.isParallel ? <Parallel> {tasks} </Parallel> : <Sequence> {tasks} </Sequence>}
    </Sequence>
  )
}

const WithTwoStepWrite: Template<ITask> = ({ name }) => (
  <Sequence>
    <Task name={`${name}-draft`} />
    <Task name={`${name}-final`} />
  </Sequence>
)

const GenericGroupWorkApproval = GenericApproval(WithTwoStepWrite)

const myGroupWorkApproval = (
  <GenericGroupWorkApproval document="myGroupWorkApproval" howManyApprovers={2} isParallel={true} />
)

/*
    
export const GenericApproval = (WorkerTaskFactory: (c:IApprovalConfiguration) => Template<ITask>) => (c:IApprovalConfiguration) => {
    const WorkerTask = WorkerTaskFactory(c);
    // create approval tasks
    const tasks = new Array(c.howManyApprovers).map((_, i) => <Task name={`approval ${i}`} />);
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
    <Task name={`${c.processName}-T1 (approvers: ${c.howManyApprovers})`} />
    <Parallel>
        <Task name="T2"/>
        <Task name="T3"/>
    </Parallel>
  </Sequence>

const GenericGroupWorkApproval = GenericApproval(GroupWork)

const myGroupWorkApproval = <GenericGroupWorkApproval 
            processName="myGroupWorkApproval"
            howManyApprovers={2}
            isParallel={true}
    />

    */

type IOrgUnit = {
  name: string
  boss: string
  parent?: IOrgUnit
}

const MyOrgApproval = (org: IOrgUnit) => {
  return <DynamicApproval document={org.name} howManyApprovers={countLevels(org)} />

  function countLevels(o: IOrgUnit) {
    let i = 1
    while (o.parent) {
      i++
      o = o.parent
    }
    return i
  }
}

describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy()
  })
})
