/** @jsx hm */
import { hm, render } from './handle'

import { WithRefProps, Template, ElementInstance, Element, CpxTemplate, ConnectionInfo, defaultConnectionInfo } from './element'
import * as g from 'generic-metamodel'
import * as t from 'aelastics-types'
import { ModelStore } from '../index'
import { Context } from './context'

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

export const Elem: Template<g.IModelElement> = (props) => {
    return new Element(g.ModelElement, props, undefined)
}

export const ElemWithText: Template<g.IModelElement> = (props) => {
    const connInfo:ConnectionInfo = defaultConnectionInfo(undefined)
    connInfo.textContentAllowed = true
    connInfo.textPropName = "label"
    return new Element(g.ModelElement, props, connInfo)
}

export type IModelProps = WithRefProps<g.IModel> & { store: ModelStore }

export const Model: CpxTemplate< IModelProps, g.IModel> = (props) => {
    return new Element(g.Model, props, undefined)
}


describe("Test jsx", () => {

    it("should create a model with one element", () => {
        let e: Element<g.IModelElement> = <Model name='model1' store={new ModelStore()}>
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
    
    it("should allow an element to have textual content if specifed so", () => {
        let e: Element<g.IModelElement> = <Model name='model1' store={new ModelStore()}>
            <ElemWithText name='el with text'>
                {"some text"}
            </ElemWithText>
        </Model>
        let m = e.render(new Context())
        expect(m).toEqual(expect.objectContaining({
            name: 'model1',
            elements: expect.arrayContaining(
                [expect.objectContaining({ name: "elwithtext", label:"some text"})]
            )
        }
        ))
    })

    it("should NOT allow an element to have textual content if specifed so", () => {
        let e: Element<g.IModelElement> = <Model name='model1' store={new ModelStore()}>
            <Elem name='el1'>
                some text
            </Elem>
        </Model>
        expect(()=>e.render(new Context())).toThrow(Error)
    })
    it("should allow an element to have textual content if specifed so", () => {
        let e: Element<g.IModelElement> = <Model name='model1' store={new ModelStore()}>
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
        let ModelCpx:CpxTemplate<{ m: string, e: string, n: number }, g.IModel> = (p) => {
            return (
                <Model name={p.m} store={new ModelStore()}>
                    {
                        Array<number>(p.n).fill(1).map((e, i) => <Elem name={`${p.e}${i}`} />)
                    }
                </Model>
            )
        }
        let me: Element<g.IModelElement> = <ModelCpx m='model' e='elem' n={3}>
            <Elem name='extra_elem' />
        </ModelCpx>

        // let m = render(me) as IModelProps
        let m = me.render(new Context())
        expect(m).toEqual(expect.objectContaining({
            name: 'model',
            elements: expect.arrayContaining([
                expect.objectContaining({ name: "elem0" }),
                expect.objectContaining({ name: "elem1" }),
                expect.objectContaining({ name: "elem2" }),
                expect.objectContaining({ name: "extra_elem" })
            ])
        }
        ))
    })

    it("should create a model with HOC element", () => {
        let hOC = (E: Template<any>) => (props: { name: string }) => {
            return <Model name='model1_HOC' store={new ModelStore()}>
                <E name={props.name}></E>
            </Model>
        }
        let Comp = hOC(Elem)
        let m = render(<Comp name='HOC' />) as g.IModel
        expect(m).toEqual(expect.objectContaining({
            name: 'model1_HOC',
            elements: expect.arrayContaining(
                [expect.objectContaining({ name: "HOC" })]
            )
        }
        ))
    })


    it("should create a model with one submodel", () => {
        let s = new ModelStore()
        let e = <Model name='model1 with submodel' store={s}>
            <Elem name='model_elem1' />
            <Model name='submodel1' store={s}>
                <Elem name='model_elem2' />
            </Model>
        </Model>

        let m = render(e) as g.IModel
        expect(m.elements.length).toEqual(2)
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

