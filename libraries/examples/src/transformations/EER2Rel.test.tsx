/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

import {  hm } from 'aelastics-synthesis'
import { SpecPoint, SpecOption} from "aelastics-synthesis"
import * as et from '../eer-model/EER.meta.model.type'
import * as rt from '../relational-model/REL.meta.model.type'
import * as e from '../eer-model/EER.jsx-comps'
import * as r from '../relational-model/REL.jsx-comps'
import { abstractM2M, M2M, E2E } from 'aelastics-synthesis';
import { Element } from 'aelastics-synthesis'
import { Context } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

@M2M({
    input: et.EERSchema,
    output: rt.RelSchema
})
class EER2RelTransformation extends abstractM2M<et.IEERSchema, rt.IRelSchema> {

    constructor(store:ModelStore) {
        super(store)
    }

    template(source:et.IEERSchema){
            return (
                <r.RelSchema name={`${source.name} Relational Schema`} content="" MDA_level="M1">
                    {source.elements
                        .filter((el) => this.context.store.isTypeOf(el, et.Entity)) 
                        .map((el) => this.Entity2Table(el as et.IEntity)
                        )}
                </r.RelSchema>
            )
        }

    @SpecPoint()
    @E2E({
        input: et.Entity, 
        output: rt.Table
    })
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
                <r.Column name = {`${k.name}ID_PK`}/>
            </r.Table>
        );
    }
    @SpecOption('Entity2Table', et.Weak)
    Week2Table(w: et.IWeak): Element<rt.ITable> { // override table name from super rule
        return (
            <r.Table name={`Weak_${w.name}`}> 
                <r.Column name = {`${w.name}ID_PK`}/>
                <r.Column name = {`OwnerID_FK`}/>
            </r.Table>
        );
    }


    @E2E({
        input: et.Attribute,
        output: rt.Column
    })
    Attribute2Column(a: et.IAttribute): Element<rt.IColumn> {
        return (
            <r.Column name={a.name}/>
        );
    }

}




describe("Test model transformations", () => {
   
    it("tests specialization of Entity2Table rule", () => {
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

        let m = new EER2RelTransformation(testStore)
        let r = m.transform(s1)
        expect(r).toHaveProperty("name", "PersonsRelationalSchema")
        /*
        expect(r.elements).toEqual(expect.arrayContaining([
                expect.objectContaining({ 
                    name: "Person",
                    columns:expect.arrayContaining([
                        expect.objectContaining({ name: "PersonID" }), // from Kernel2Table
                        expect.objectContaining({ name: "PersonName" }) // from Entity2Table
                    ])
                }),
              //  expect.objectContaining({ name: "Weak_Child" }),
              //  expect.objectContaining({ name: "ChildID_FK" })
            ])
        )*/

    })
})

