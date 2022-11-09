/** @jsx STX.h */

import { Attribute, Kernel, IModelElementProps, Domain } from './EER-components'
import { STX } from '../../jsx/handle'
import { IKernel } from './EER.meta.model.type'

export const KernelWithId: STX.Template<IModelElementProps & STX.InstanceProps, IKernel> = (
  props, store
) => {
  let d = <Domain  name={'String'} />
  return (
    <Kernel name={props.name} >
      <Attribute name={`${props.name}ID`} isKey={true}>
        <Domain $ref={d}/>
      </Attribute>
    </Kernel>
  )
}

export function HOT_KernelWithId(
  K: STX.Template<IModelElementProps & STX.InstanceProps, IKernel>
): (props: IModelElementProps) => STX.Template<IModelElementProps & STX.InstanceProps, IKernel> {
  return (props) => (
    <K name={props.name}>
      <Attribute name={`${props.name}ID`} isKey={true} ></Attribute>
    </K>
  )
}


describe('Testing ERProjectStore', () => {
  test('component', () => {

    let k = STX.create(()=> <KernelWithId name='Person'/>)

    expect(k).toHaveProperty("name", "Person");
  })

  test('hoc component', () => {
    let k = ()=><Kernel name={'Radnik'} />
    let C = HOT_KernelWithId(k)

    let m = STX.create(()=> <C name='Person'></C>)

    expect(m).toHaveProperty("name", "Radnik");
  })
})

