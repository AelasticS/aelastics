/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

import { hm, Template } from 'aelastics-synthesis'
import * as t from "aelastics-types"
import { Process, Sequence, Task, Document, OutputDocument, InputDocument, Parallel } from './BPM.jsx-comps'
import { IProcess, ISequence, ITask } from './BPM.meta.model.type'
import { dep1 } from '../Organization/example-department'
import { IOrganization } from '../Organization/organization.model.type'
import { ModelStore } from 'aelastics-synthesis'
import { Element } from 'aelastics-synthesis'

export const Approval_X_times_Par = (x: number) => () => {
    let f: () => Element<IProcess> = () => {
        let tasks = Array<string>() // create approval tasks names
        for (let i = 1; i <= x; i++) {
            tasks.push(`${i}`)
        }
        return (
            <Process name='Approval' store={new ModelStore()}>
                <Sequence>
                    <Task name='write' />
                    <Parallel>
                        {
                            tasks.map(t => <Task name={`approval ${t}`} />)
                        }
                    </Parallel>
                </Sequence>
            </Process>)
    }
    return f;
}

export const Approval_X_Par = (x: number, isParallel: boolean) => () => {
    let f: () => Element<IProcess> = () => {
        let tasks = new Array<string>() // create approval tasks names
        for (let i = 1; i <= x; i++) {
            tasks.push(`approval ${i}`)
        }
        return (
            <Process name='Approval'>
                <Sequence>
                    <Task name='write' />
                    {isParallel ?
                        <Parallel>
                            {tasks.map(t => <Task name={`approval ${t}`} />)}
                        </Parallel>
                        :
                        <Sequence>
                            {tasks.map(t => <Task name={`approval ${t}`} />)}
                        </Sequence>
                    }
                </Sequence>
            </Process>)
    }
    return f
}



export const GenericApprovalHOC = (x: number, isParallel: boolean, WorkerTask: Template<ITask>) => () => {
    let f: (props: ITask) => Element<IProcess> = (props) => {
        let tasks = new Array<string>() // create approval tasks names
        for (let i = 1; i <= x; i++) {
            tasks.push(`approval ${i}`)
        }
        return (
            <Sequence>
                <WorkerTask {...props} />
                {isParallel ?
                    <Parallel>
                        {tasks.map(t => <Task name={`approval ${t}`} />)}
                    </Parallel>
                    :
                    <Sequence>
                        {tasks.map(t => <Task name={`approval ${t}`} />)}
                    </Sequence>
                }
            </Sequence>
        )
    }
    return f
}


export const ApprovalConfig = t.object({
    xTimes: t.number,
    isParallel: t.boolean
})

type IApprovalConfig = t.TypeOf<typeof ApprovalConfig>

const appConfig1: IApprovalConfig = { xTimes: 3, isParallel: false }

const Approval = (cnfg:IApprovalConfig) => {
    return <Process name='Approval'>
        {GenericApprovalHOC(cnfg.xTimes, cnfg.isParallel, <Task name="write" />)}
    </Process>
}


const createApprovalConfig: (org: IOrganization) => IApprovalConfig =
    (org) => {
        return {
            xTimes: org.departments.length,
            isParallel: false
        }
    }


const Approval_Par_Config: (org: IOrganization) => IProcess =
    (org) => {
        let { xTimes, isParallel } = createApprovalConfig(org)
        return <Process name='Approval'>
            {GenericApprovalHOC(xTimes, isParallel, <Task name="write" />)}
        </Process>
    }

const Approval_Par_ConfigHOC: (WorkerTask: Template<ITask>) => (org: IOrganization) => IProcess =
    (WorkerTask) => (org) => {
        let { xTimes, isParallel } = createApprovalConfig(org)
        return <Process name='Approval'>
            {GenericApprovalHOC(xTimes, isParallel, <WorkerTask name="write" />)}
        </Process>
    }

const Approval_Par_Write_ConfigHOC = Approval_Par_ConfigHOC(<Task name="write" />)


const Approval_Par_Write_Dept1 = Approval_Par_Write_ConfigHOC(dep1)

describe("Dummy test", () => {
    it("works if true is truthy", () => {
        expect(true).toBeTruthy()
    })
})
