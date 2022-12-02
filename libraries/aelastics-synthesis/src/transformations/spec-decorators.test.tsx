/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)



import {  hm } from '../jsx/handle'
import { M2M, E2E } from "./trace-decorators"
import { SpecPoint, SpecOption} from "./spec-decorators"
import * as et from '../test/eer-model/EER.meta.model.type'
import * as rt from '../test/relational-model/REL.meta.model.type'
import * as e from '../test/eer-model/EER-components'
import * as r from '../test/relational-model/REL-components'
import { abstractM2M } from './abstractM2M';
import { Element } from '../jsx/element'
import { Context } from '../jsx/context'
import { ModelStore } from '../jsx/ModelsStore'

const testStore = new ModelStore()

const eerSchema1:Element<et.IEERSchema> = <e.EERSchema id='1' name='Persons' MDA_level='M1' store={testStore}>
    <e.Kernel id='2' name='Person'>
        <e.Attribute id='3' name='PersonID'>
            <e.Domain id='4' name='number' />
        </e.Attribute>
        <e.Attribute id='5' name='PersonName'>
            <e.Domain id='6' name='string' />
        </e.Attribute>
    </e.Kernel>
    <e.Weak id='11' name='Child'>
        <e.Attribute id='13' name='ChildID'>
            <e.Domain id='14' name='number' />
        </e.Attribute>
        <e.Attribute id='15' name='ChildName'>
            <e.Domain id='16' name='string' />
        </e.Attribute>
    </e.Weak>
</e.EERSchema>

const s1:et.IEERSchema = eerSchema1.render(new Context())
// const k1 = eerSchema1.instance.elements[0]


// @M2M({
//     input: e.EERSchema,
//     output: r.RelSchema
// })
class EER2RelTransformation extends abstractM2M<et.IEERSchema, rt.IRelSchema> {

    constructor(store:ModelStore) {
        super(store)
    }

    template(s:et.IEERSchema){
            return (
                <r.RelSchema name={s.name} content="" MDA_level="M1" id={"1"}>
                    {s.elements
                        .filter((el) => this.context.store.isTypeOf(el, et.Entity)) //  el.objectClassification == "Kernel")
                        .map((el) => this.Entity2Table(el as et.IEntity)
                        )}
                </r.RelSchema>
            )
        }


    // @E2E({
    //     input: e.Entity,
    //     output: r.Table
    // })
    @SpecPoint('EntityType')
    Entity2Table(e: et.IEntity): Element<rt.ITable> {
        return (
            <r.Table name={e.name}>
                {e.attributes.map((a) => this.Attribute2Column(a))}
            </r.Table>
        );
    }

    @SpecOption('Entity2Table', et.Kernel)
    Kernel2Table(k: et.IKernel): Element<rt.ITable> {
        return (
            <r.Table name={k.name}>
                <r.Column name = {`${k.name}ID`}>
                    <r.Domain name='number'/>
                </r.Column>
            </r.Table>
        );
    }
    @SpecOption('Entity2Table', et.Weak)
    Week2Table(w: et.IWeak): Element<rt.ITable> {
        return (
            <r.Table name={w.name}>
            </r.Table>
        );
    }


    // @E2E({
    //     input: e.Attribute,
    //     output: r.Column
    // })
    Attribute2Column(a: et.IAttribute): Element<rt.IColumn> {
        return (
            <r.Column name={a.name}>

            </r.Column>
        );
    }

}

describe("Test model transformations", () => {
    it("tests eer to tables", () => {
        let m = new EER2RelTransformation(testStore)
        let r = m.transform(s1)
        expect(r).toHaveProperty("name", "Persons")
        expect(r).toEqual(expect.objectContaining({
            name: 'Persons',
            elements: expect.arrayContaining([
                expect.objectContaining({ 
                    name: "Person",
                    columns:expect.arrayContaining([expect.objectContaining({ name: "PersonID" })])
                }),
                expect.objectContaining({ name: "PersonID" }),
                expect.objectContaining({ name: "Child" }),
                expect.objectContaining({ name: "ChildID" })
            ])
        }
        ))

    })
})

