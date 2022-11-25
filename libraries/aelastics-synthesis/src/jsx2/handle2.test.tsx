/** @jsx hm */
import {hm, WithRefProps, Template, create, useContext, ElementInstance, render} from './handle2'
import * as g from 'generic-metamodel'
import * as t from 'aelastics-types'
import { ModelStore } from './ModelsStore'

export type IDomain = {
    name: string
    // subelements?: Array<IElement>
    model?: g.IModel
}

export type IElementProps =  WithRefProps<g.IModelElement> 

export const Element: Template<IElementProps>  = (props) => {
    const ctx = useContext()
    const f:(props: IElementProps) => ElementInstance<g.IModelElement> = (props:IElementProps)=> {
        const el = create<g.IModelElement>(g.ModelElement, props, ctx)
        return el
    }
    return {
        create:f,
        props:props,
        children:[],
        assoc:{}
    }
}

export type IModelProps = WithRefProps<g.IModel> &  {store:ModelStore}

export const Model: Template<IModelProps>  = (props) => {
    const ctx = useContext()
    const f:(props: IModelProps) => ElementInstance<g.IModel> = (props:IModelProps)=> {
        const model = create<g.IModel>(g.Model, props, ctx)
        return model
    }
    return {
        create:f,
        props:props,
        children:[],
        assoc:{}
    }
}


export const ModelCpx = (props:IModelProps) => {
    return <Model store = {props.store} name='' description=' ' id='' label=''>
 
    </Model>
}
// const  C1 = (props:{name:string}) => {
//     return <Element name = {props.name}/>
// }
// let c0 = <Element name='e1'/>
// let c1 = <C1 name ='c1'/>
// let r0 = c0.type(c0.props)
// let r1 = c1.type(c1.props)
// let m = <Model store={new ModelStore()} >
//         <Element name = "e1">
//         </Element>
//         <Element name = "e2">
//             <Element name = "e2.1">
//             { ModelCpx({store:new ModelStore()})}
//             { 2+3 } {[1,2,3].map((e)=>e)}
//                 "text"
//             </Element>
//         </Element>
//     </Model>




describe("Dummy test", () => {
    let m = <Model name='model1' store ={new ModelStore()}>
            <Element name='el1'>
            </Element>
        </Model>
    render(m)
    it("works if true is truthy", () => {
      expect(m.e).toBeTruthy()
    })})