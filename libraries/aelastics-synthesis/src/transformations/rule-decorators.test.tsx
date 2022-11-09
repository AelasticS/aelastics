/** @jsx STX.h */
/*
 * Copyright (c) AelasticS 2022.
 */

const EER = getEER({} as IModel, null)



import { STX } from '../jsx/handle'

import { M2M, E2E } from "./rule-decorators"
import { IModel } from "generic-metamodel";
import * as e from '../test/eer-model/EER.meta.model.type'
import * as r from '../test/relational-model/REL.meta.model.type'
import { Attribute, Domain, sinisa, EERComps, EERSchema, getEER, Kernel, } from '../test/eer-model/EER-components'
import { Column } from '../test/relational-model/REL-components'
import { Table, RelSchema } from '../test/relational-model/REL-components'
import { abstractM2M } from './abstractM2M';

const eerSchema1 = <EERSchema id='1' name='Persons' MDA_level='M1'>
    <Kernel id='2' name='Person'>
        <Attribute id='3' name='PersonID'>
            <Domain id='4' name='number' />
        </Attribute>
        <Attribute id='5' name='PersonName'>
            <Domain id='6' name='string' />
        </Attribute>
    </Kernel>
</EERSchema>

const s1 = eerSchema1
const k1 = eerSchema1.instance.elements[0]


@M2M({
    input: e.EERSchema,
    output: r.RelSchema
})
class EER2Rel extends abstractM2M<e.IEERSchema, r.IRelSchema> {

    public transform(): STX.Child<r.IRelSchema> {
        let s = this.source
        return (
            <RelSchema name={s.name} content="" MDA_level="M1" id={"1"}>
                {s.elements
                    .filter((e) => e.objectClassification == "Entity")
                    .map((e) => this.Entity2Table(e as e.IEntity)
                    )}
            </RelSchema>
        )
    }

    @E2E({
        input: e.Entity,
        output: r.Table
    })
    Entity2Table(e: e.IEntity): STX.Child<r.ITable> {
        return (
            <Table name={e.name}>
                {e.attributes.map((a) => this.Attribute2Column(a))}
            </Table>
        );
    }

    @E2E({
        input: e.Attribute,
        output: r.Column
    })

    Attribute2Column(a: e.IAttribute): STX.Child<r.IColumn> {
        return (
            <Column name={a.name}>

            </Column>
        );
    }

}

describe("Test E2E decorator", () => {
    let m = new EER2Rel(eerSchema1)
    it("tests @E2E decorator", () => {
        let m = new EER2Rel(eerSchema1)
        let t1 = m.Entity2Table(k1)
        expect(t1.instance).toHaveProperty("name", "Person")
    })

    it("tests @M2M decorator", () => {
        <sinisa.Kernel>

        </sinisa.Kernel>
        let m = new EER2Rel(eerSchema1)
        expect(m).toHaveProperty("name", "Persons")
    })

    it("tests @M2M decorator", () => {
        <EER.Kernel> </EER.Kernel>
        
        let m = new EER2Rel(eerSchema1)
        expect(m).toHaveProperty("name", "Persons")
    })
})

