/** @jsx hm */
// /*
//  * Copyright (c) AelasticS 2022.
//  */

import { hm, Template } from "aelastics-synthesis";
import * as t from "aelastics-types";
import {
  Process,
  Sequence,
  Task,
  Document,
  OutputDocument,
  InputDocument,
  Parallel,
} from "./BPM.jsx-comps";
import { IProcess, ISequence, ITask } from "./BPM.meta.model.type";
import { dep1 } from "../Organization/example-department";
import { IOrganization } from "../Organization/organization.model.type";
import { ModelStore } from "aelastics-synthesis";
import { Element } from "aelastics-synthesis";


export const StaticApproval:IProcess =  
      <Process name="Approval">
        <Sequence>
          <Task name="Write proposal" />
          <Task name="Approve proposal" />
        </Sequence>
      </Process>
  


export type IApprovalConfiguration = {
    processName: string,
    howManyApprovers: number,
    isParallel?:boolean
}

export const DynamicApproval = ({processName, howManyApprovers } :IApprovalConfiguration) => {
  return (
    <Process name={processName}>
      <Sequence>
        <Task name="write proposal" />
        { // create approval tasks
          new Array(howManyApprovers).map((_, i) => <Task name={`approval ${i}`} />)
        }
      </Sequence>
    </Process>
  );
};

const myDynamicApproval:IProcess = <DynamicApproval processName="My Approval" howManyApprovers={3}/>


export const MoreDynamicApproval = ({isParallel, howManyApprovers } :IApprovalConfiguration) => {
  // create approval tasks
  const tasks = new Array(howManyApprovers).map((_, i) => <Task name={`approval ${i}`}/>);
  return (
    <Process name="Approval">
      <Sequence>
        <Task name="write" />
        {isParallel ? <Parallel> {tasks} </Parallel>
                    : <Sequence> {tasks} </Sequence>
         }
      </Sequence>
    </Process>
  );
};

const myMoreDynamicApproval:IProcess = 
    <MoreDynamicApproval processName="My Approval" howManyApprovers={3}/>



export const GenericApproval = (WorkerTask: Template<ITask>) => (c:IApprovalConfiguration) => {
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

const GroupWork = () => 
  <Sequence>
    <Task name="T1"/>
    <Parallel>
        <Task name="T2"/>
        <Task name="T3"/>
    </Parallel>
  </Sequence>

const GenericGroupWorkApproval = GenericApproval(GroupWork)

const myGroupWorkApproval =  
    <GenericGroupWorkApproval 
            processName="myGroupWorkApproval"
            howManyApprovers={2}
            isParallel={true}
    />


type IOrgUnit = {
    name:string,
    boss:string
    parent?:IOrgUnit
}


const MyOrgApproval = (org: IOrgUnit) => {
  return <DynamicApproval processName={org.name} howManyApprovers={countLevels(org)}/>

  function countLevels(o:IOrgUnit) {
    let i = 1
    while (o.parent) { i++; o = o.parent}
    return i
    }
}

describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy();
  });
});
