/** @jsx hm */
import { hm, WithRefProps, Template, create, useContext, ElementInstance, render, Element } from './handle2'
import * as g from 'generic-metamodel'
import * as t from 'aelastics-types'
import { ModelStore } from './ModelsStore'
import { IModelElement } from 'generic-metamodel'

export type IDomain = {
    name: string
    // subelements?: Array<IElement>
    model?: g.IModel
}

export type IElementProps = WithRefProps<g.IModelElement>

export const Elem: Template<IElementProps> = (props) => {
    const ctx = useContext()
    const f: (props: IElementProps) => ElementInstance<g.IModelElement> = (props: IElementProps) => {
        const el = create<g.IModelElement>(g.ModelElement, props, ctx)
        return el
    }
    return {
        create: f,
        props: props,
        children: [],
        assoc: {}
    }
}

export type IModelProps = WithRefProps<g.IModel> & { store: ModelStore }

export const Model: Template<IModelProps> = (props) => {
    const ctx = useContext()
    const f: (props: IModelProps) => ElementInstance<g.IModel> = (props: IModelProps) => {
        const model = create<g.IModel>(g.Model, props, ctx)
        return model
    }
    return {
        create: f,
        props: props,
        children: [],
        assoc: {}
    }
}


// export const ModelCpx = (props: IModelProps) => {
//     return <Model store={props.store} name='' description=' ' id='' label=''>

//     </Model>
// }


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




describe("Test jsx", () => {

    // it("should create a model with one element", () => {
    //     let e = <Model name='model1' store={new ModelStore()}>
    //         <Elem name='el1'>
    //         </Elem>
    //     </Model>
    //     let m = render(e) as IModelProps
    //     expect(m).toEqual(expect.objectContaining({
    //         name: 'model1',
    //         elements: expect.arrayContaining(
    //             [expect.objectContaining({ name: "el1" })]
    //         )
    //     }
    //     ))
    // })

    it("should create a model with 3 dynamic elements using model template", () => {
        let ModelCpx = (p: { m: string, e: string, n: number }) => {

            return (<Model name={p.m} store={new ModelStore()}>
                {
                    Array<number>(p.n).fill(1).map((e, i) => <Elem name={`${p.e}${i}`} />)
                }
                {/* <Elem name={p.e}>
            </Elem> */}
            </Model>)
        }

        let me = <ModelCpx m='model' e='elem' n={3}>
            <Elem name='extra elem' />
        </ModelCpx>

        let m = render(me) as IModelProps

        expect(m).toEqual(expect.objectContaining({
            name: 'model',
            elements: expect.arrayContaining([
                expect.objectContaining({ name: "elem0" }),
                expect.objectContaining({ name: "elem1" }),
                expect.objectContaining({ name: "elem2" }),
                expect.objectContaining({ name: "extra elem" })
            ])
        }
        ))
    })
    it("should create a model with HOC element", () => {
        let hOC = (E:Template<any>) => (props:{name:string}) => {
        return <Model name='model1' store={new ModelStore()}>
            <E name= {props.name}></E>
            </Model>
        }
        let Comp = hOC(Elem)
        let m = render(<Comp name='HOC'/>) as g.IModel
        expect(m).toEqual(expect.objectContaining({
            name: 'model1',
            elements: expect.arrayContaining(
                [expect.objectContaining({ name: "HOC" })]
            )
        }
        ))
    })
})
