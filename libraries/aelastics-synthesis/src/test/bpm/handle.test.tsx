/** @jsx STX.h */
/*
 * Copyright (c) AelasticS 2022.
 */
import { STX } from '../../jsx/handle'
import { Process, IProcessProps, Sequence, Task, ISequenceProps, Document, OutputDocument, InputDocument } from './BPM.components'
import { IProcess, ISequence } from './BPM.meta.model.type'

export const Approval1: () => STX.Child<IProcess> = () => {
  let r = <Process name='Approval'>
    <Task name='write' />
  </Process>
  return r as STX.Child<IProcess>
}

export const Approval2 = () => {
  return <Process name='Approval'>
    <Sequence>
      <Task name='write' />
      <Task name='approve' />
    </Sequence>
  </Process>
}

describe('test connect functions', () => {
  it('should connect parent and child', () => {
    const cnNodes = STX.createConnectFun({
      childPropName: "parent",
      childPropType: 'Object',
      parentPropName: "children",
      parentPropType: 'Array'
    })
    let obj1 = { name: "obj1" }
    let obj2 = { name: "obj2" }
    cnNodes(obj1, obj2)
    expect(obj2["parent"]).toBe(obj1)
    expect(obj1["children"]).toContain(obj2)
  });

});

describe('test create function', () => {

  it('should create Approval1', () => {
    let a = STX.create<IProcessProps, IProcess>(() => <Approval1 />)
    expect(a).toHaveProperty("name", "Approval");
  });

  it('should create direct Sequence tag', () => {
    let a = STX.create<ISequenceProps, ISequence>(() =>
      <Sequence name='seq1'>
        <Task name='write' />
        <Task name='approve' />
      </Sequence>)
    expect(a).toHaveProperty("name", "seq1");
    expect(a.children.length).toEqual(2)
    //   let [first, second] = a.children
    //   expect(first).toEqual(expect.objectContaining({ name: "write" }))
    expect(a.children).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "write", parent:a}),
      expect.objectContaining({ name: "approve", parent:a })]))
  });

});

describe('test create function', () => {

  it('should create Approval1', () => {
    let a = STX.create<IProcessProps, IProcess>(() => <Approval1 />)
    expect(a).toHaveProperty("name", "Approval");
  });

  it('should connect using references', () => {
    let a = STX.create<ISequenceProps, ISequence>(() =>
      <Sequence name='seq1'>
        <Document name='Proposal' $id='doc1'/>
        <Document name='Final result' $id='doc2'/>
        <Task name='write'>
        <OutputDocument $ref_id='doc1'/>
        </Task>
        <Task name='approve' >
          <InputDocument $ref_id='doc1'/>
          <OutputDocument $ref_id='doc2'/>
        </Task>
      </Sequence>)
    expect(a).toHaveProperty("name", "seq1");
    expect(a.children.length).toEqual(4)
    expect(a.children).toEqual(expect.arrayContaining(
      [expect.objectContaining(
          { name: "write", parent:a, 
            outputs:expect.arrayContaining([expect.objectContaining({name:'Proposal'})])
          }),
          expect.objectContaining(
            { name: "approve", parent:a, 
            inputs:expect.arrayContaining([expect.objectContaining({name:'Proposal'})]),
            outputs:expect.arrayContaining([expect.objectContaining({name:'Final result'})])
          })
       ])
    )})})
