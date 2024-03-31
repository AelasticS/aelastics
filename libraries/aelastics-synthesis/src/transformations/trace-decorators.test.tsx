/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)



import {  hm } from '../jsx/handle'
import { M2M, E2E } from "./trace-decorators"
import * as e from '../test/eer-model/EER.meta.model.type'
import * as r from '../test/relational-model/REL.meta.model.type'
import { Attribute, Domain, EERSchema, Kernel, } from '../test/eer-model/EER-components'
import { Column } from '../test/relational-model/REL-components'
import { Table, RelSchema } from '../test/relational-model/REL-components'
import { abstractM2M } from './abstractM2M';
import { Element, Template } from '../jsx/element'
import { Context } from '../jsx/context'
import { ModelStore } from '../index'

const eerSchema1:Element<e.IEERSchema> = <EERSchema id='1' name='Persons' MDA_level='M1' store={new ModelStore()}>
    <Kernel id='2' name='Person'>
        <Attribute id='3' name='PersonID'>
            <Domain id='4' name='number' />
        </Attribute>
        <Attribute id='5' name='PersonName'>
            <Domain id='6' name='string' />
        </Attribute>
    </Kernel>
</EERSchema>

const s1:e.IEERSchema = eerSchema1.render(new Context())
// const k1 = eerSchema1.instance.elements[0]


@M2M({
    input: e.EERSchema,
    output: r.RelSchema
})
class EER2RelTransformation extends abstractM2M<e.IEERSchema, r.IRelSchema> {

    constructor(store:ModelStore) {
        super(store)
    }

    template(s:e.IEERSchema){
            return (
                <RelSchema name={s.name} content="" MDA_level="M1" id={"1"}>
                    {s.elements
                        .filter((e) => e.objectClassification == "Kernel")
                        .map((e) => this.Entity2Table(e as e.IEntity)
                        )}
                </RelSchema>
            )
        }


    @E2E({
        input: e.Entity,
        output: r.Table
    })
    Entity2Table(e: e.IEntity): Element<r.ITable> {
        let f = (a: e.IAttribute) => 
                    this.Attribute2Column(a)
        return (
            <Table name={e.name}>
                {e.attributes.map(f)}
            </Table>
        );
    }

    @E2E({
        input: e.Attribute,
        output: r.Column
    })
    Attribute2Column(a: e.IAttribute): Element<r.IColumn> {
        return (
            <Column name={a.name}>

            </Column>
        );
    }

}

describe("Test model transformations", () => {
    it("tests eer to tables", () => {
        let m = new EER2RelTransformation(new ModelStore())
        let r = m.transform(s1)
        expect(r).toHaveProperty("name", "Persons")
        expect(r).toEqual(expect.objectContaining({
            name: 'Persons',
            elements: expect.arrayContaining([
                expect.objectContaining({ name: "Person" }),
                expect.objectContaining({ name: "PersonID" })
            ])
        }
        ))

    })
})

