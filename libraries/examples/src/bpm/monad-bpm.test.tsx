/** @jsx hm */
// /*
//  * Copyright (c) AelasticS 2023.
//  */

import { hm, Template } from 'aelastics-synthesis'
import * as t from "aelastics-types"
import { Process, Sequence, Task, Document, OutputDocument, InputDocument, Parallel } from './BPM.jsx-comps'
import { IProcess, ISequence, ITask } from './BPM.meta.model.type'
import { dep1 } from '../Organization/example-department'
import { IOrganization } from '../Organization/organization.model.type'
import { ModelStore } from 'aelastics-synthesis'
import { Element } from 'aelastics-synthesis'
import { ModelM, ModelE } from './monad-bpm'


export interface IApproval {
    x: number, 
    isParallel: boolean
}

export const Approval_X_Par = (props:IApproval) => {
    let f: () => Element<IProcess> = () => {
        // create approval tasks names 
        let tasks = Array.from({length: props.x}, (_, i) => i + 1)
        return (
            <Process name='Approval'>
                <Sequence>
                    <Task name='write' />
                    {props.isParallel ?
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

const m1 = ModelM.of<string>()

m1.apply(<Approval_X_Par isParallel = {true} x={3} />)


const m2 = ModelE.of<string>()
    .apply(<Approval_X_Par isParallel = {true} x={3}>

          </Approval_X_Par>
        )

m2.apply(<Approval_X_Par isParallel = {true} x={3}/>)

m2.apply(Approval_X_Par({x:3, isParallel:true}))

/*
left-identity law:
          of(x).apply(f) == f(x)
right-identity law:
        m.apply(of) == m
associativity law:
    m.apply(f).apply(g) == m.apply(x ⇒ f(x).apply(g))


left-identity law:
    unit(x).flatMap(f) == f(x)
right-identity law:
    m.flatMap(unit) == m
associativity law:
    m.flatMap(f).flatMap(g) == m.flatMap(x ⇒ f(x).flatMap(g))

*/

describe("Dummy test", () => {
    it("works if true is truthy", () => {
        expect(true).toBeTruthy()
    })
})