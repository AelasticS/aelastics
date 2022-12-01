/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

import {hm} from '../../jsx/handle'
import { Context } from '../../jsx/context';
import { Element } from '../../jsx/element';
import { ModelStore } from '../../jsx/ModelsStore';
import { Process, Sequence, Task, Document, OutputDocument, InputDocument } from './BPM.components'
import { IProcess, ISequence } from './BPM.meta.model.type'

describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy()
  })})

  /*
describe('test create function', () => {

  it('should create direct Sequence tag', () => {
    let e: Element<IProcess> = <Process name='Approval' store={new ModelStore()}>
      <Sequence name='seq1'>
        <Task name='write' />
        <Task name='approve' />
      </Sequence>
    </Process>

    let p: IProcess = e.render(new Context())
    let a: ISequence = p.elements[0] as ISequence
    expect(a).toHaveProperty("name", "seq1");
    expect(a.children.length).toEqual(2)
    //   let [first, second] = a.children
    //   expect(first).toEqual(expect.objectContaining({ name: "write" }))
    expect(a.children).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "write", parent: a }),
      expect.objectContaining({ name: "approve", parent: a })]))
  });

});

*/


/*
describe('test create function', () => {

  it('should connect using references', () => {
    let e: Element<IProcess> = <Process name='Approval' store={new ModelStore()}>
      <Sequence name='seq1'>
        <Document name='Proposal' $id='doc1' />
        <Document name='Final result' $id='doc2' />
        <Task name='write'>
          <OutputDocument $ref_id='doc1' />
        </Task>
        <Task name='approve' >
          <InputDocument $ref_id='doc1' />
          <OutputDocument $ref_id='doc2' />
        </Task>
      </Sequence>)
    </Process>

    let p: IProcess = e.render(new Context())
    let a: ISequence = p.elements[0] as ISequence
    expect(a).toHaveProperty("name", "seq1");
    expect(a.children.length).toEqual(4)
    expect(a.children).toEqual(expect.arrayContaining(
      [expect.objectContaining(
        {
          name: "write", parent: a,
          outputs: expect.arrayContaining([expect.objectContaining({ name: 'Proposal' })])
        }),
      expect.objectContaining(
        {
          name: "approve", parent: a,
          inputs: expect.arrayContaining([expect.objectContaining({ name: 'Proposal' })]),
          outputs: expect.arrayContaining([expect.objectContaining({ name: 'Final result' })])
        })
      ])
    )
  })
})
*/
