/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)



import {  hm } from 'aelastics-synthesis'
import { SpecPoint, SpecOption} from "aelastics-synthesis"
import * as et from '../eer-model/EER.meta.model.type'
import * as rt from '../relational-model/REL.meta.model.type'
import * as e from '../eer-model/EER.jsx-comps'
import * as r from '../relational-model/REL.jsx-comps'
import { abstractM2M } from 'aelastics-synthesis';
import { Element } from 'aelastics-synthesis'
import { Context } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

const testStore = new ModelStore()

const eerSchema1:Element<et.IEERSchema> = <e.EERSchema id='1' name='Persons' MDA_level='M1' store={testStore}>
    <e.Kernel id='2' name='Person'>
        <e.Attribute id='5' name='PersonName'>
            <e.Domain id='6' name='string' />
        </e.Attribute>
    </e.Kernel>
    <e.Weak id='11' name='Child'>
        <e.Attribute id='13' name='ChildID'>
            <e.Domain name ='number' />
        </e.Attribute>
        <e.Attribute id='15' name='ChildName'>
            <e.Domain $refByName='string' />
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
                <r.RelSchema name={`${s.name} Relational Schema`} content="" MDA_level="M1">
                    {s.elements
                        .filter((el) => this.context.store.isTypeOf(el, et.Entity)) 
                        .map((el) => this.Entity2Table(el as et.IEntity)
                        )}
                </r.RelSchema>
            )
        }


    // @E2E({
    //     input: e.Entity,
    //     output: r.Table
    // })
    @SpecPoint()
    Entity2Table(e: et.IEntity): Element<rt.ITable> {
        return (
            <r.Table name={e.name}>
                {e.attributes.map((a) => this.Attribute2Column(a))}
            </r.Table>
        );
    }

    @SpecOption('Entity2Table', et.Kernel)
    Kernel2Table(k: et.IKernel): Element<rt.ITable> { // inherit table name and column from super rule
        return (
            <r.Table>  
                <r.Column name = {`${k.name}ID`}>
                    <r.Domain name='number'/>
                </r.Column>
            </r.Table>
        );
    }
    @SpecOption('Entity2Table', et.Weak)
    Week2Table(w: et.IWeak): Element<rt.ITable> { // override table name from super rule
        return (
            <r.Table name={`Weak_${w.name}`}> 
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

describe("Test spec decorators", () => {
    it("tests specialization of Entit2Table rule", () => {
        let m = new EER2RelTransformation(testStore)
        let r = m.transform(s1)
        expect(r).toHaveProperty("name", "PersonsRelationalSchema")
        expect(r.elements).toEqual(expect.arrayContaining([
                expect.objectContaining({ 
                    name: "Person",
                    columns:expect.arrayContaining([
                        expect.objectContaining({ name: "PersonID" }), // from Kernel2Table
                        expect.objectContaining({ name: "PersonName" }) // from Entity2Table
                    ])
                }),
                expect.objectContaining({ name: "Weak_Child" }),
                expect.objectContaining({ name: "ChildID" })
            ])
        )

    })
})

