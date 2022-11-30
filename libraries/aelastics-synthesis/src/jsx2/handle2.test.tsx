/** @jsx hm */
import {hm, render} from './handle2'

import {WithRefProps, Template, ElementInstance, Element} from './element'
import * as g from 'generic-metamodel'
import * as t from 'aelastics-types'
import { ModelStore } from './ModelsStore'
import { Context} from './context'

export type IDomain = {
    name: string
    // subelements?: Array<IElement>
    model?: g.IModel
}

export type IElementProps = WithRefProps<g.IModelElement>

// export const Elem: Template<IElementProps> = (props) => {
//     const ctx = useContext()
//     const f: (props: IElementProps) => ElementInstance<g.IModelElement> = (props: IElementProps) => {
//         const el = create<g.IModelElement>(g.ModelElement, props, ctx)
//         return el
//     }
//     return {
//         create: f,
//         props: props,
//         children: [],
//         assoc: {}
//     }
// }

export const Elem: Template<IElementProps> = (props) => {
    return new Element(g.ModelElement,props, undefined)
}

export type IModelProps = WithRefProps<g.IModel> & { store: ModelStore }

export const Model: Template<IModelProps> = (props) => {
    return new Element(g.Model,props, undefined)
}


describe("Test jsx", () => {

    it("should create a model with one element", () => {
        let e:Element<g.IModelElement> = <Model name='model1' store={new ModelStore()}>
            <Elem name='el1'>
            </Elem>
        </Model>
        let m = e.render(new Context())
        //let m = render(e) as IModelProps
        expect(m).toEqual(expect.objectContaining({
            name: 'model1',
            elements: expect.arrayContaining(
                [expect.objectContaining({ name: "el1" })]
            )
        }
        ))
    })

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
        let me:Element<g.IModelElement> = <ModelCpx m='model' e='elem' n={3}>
                <Elem name='extra elem' />
            </ModelCpx>

        // let m = render(me) as IModelProps
        let m = me.render(new Context())
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
        let hOC = (E: Template<any>) => (props: { name: string }) => {
            return <Model name='model1 HOC' store={new ModelStore()}>
                <E name={props.name}></E>
            </Model>
        }
        let Comp = hOC(Elem)
        let m = render(<Comp name='HOC'/>) as g.IModel
        expect(m).toEqual(expect.objectContaining({
            name: 'model1 HOC',
            elements: expect.arrayContaining(
                [expect.objectContaining({ name: "HOC" })]
            )
        }
        ))
    })

    it("should create a model with one submodel", () => {
        let e = <Model name='model1 with submodel' store={new ModelStore()}>
            <Elem name='model elem1' />
            <Model name='submodel1' store={new ModelStore()}>
                <Elem name='model elem2' />
            </Model>
        </Model>

        let m = render(e) as g.IModel
        let e1 = m.elements[1]
        expect(e1.name).toEqual('submodel1')
    })

    it("should create a model with one element obtained by a function", () => {
        const fElem = () => {
            return <Elem name='el1' />
        }

        let e = <Model name='model1' store={new ModelStore()}>
            {fElem()}
        </Model>
        let m = render(e) as IModelProps
        expect(m).toEqual(expect.objectContaining({
            name: 'model1',
            elements: expect.arrayContaining(
                [expect.objectContaining({ name: "el1" })]
            )
        }
        ))
    })
})

