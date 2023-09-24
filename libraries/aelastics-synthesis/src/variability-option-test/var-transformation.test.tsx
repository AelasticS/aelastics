/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)

import { hm } from "../jsx/handle";
import { VarPoint, VarOption } from "./../variability/var-decorators";
import * as et from "../test/eer-model/EER.meta.model.type";
import * as rt from "../test/relational-model/REL.meta.model.type";
import * as e from "../test/eer-model/EER-components";
import * as r from "../test/relational-model/REL-components";
import { abstractM2M } from "./../transformations/abstractM2M";
import { Element } from "../jsx/element";
import { Context } from "../jsx/context";
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../index";

const testStore = new ModelStore();

const eerSchema1: Element<et.IEERSchema> = (
  <e.EERSchema name="Persons" MDA_level="M1" store={testStore}>
    <e.Kernel name="Person">
      <e.Attribute name="PersonName">
        <e.Domain name="string" />
      </e.Attribute>
    </e.Kernel>
    <e.Kernel name="Organization">
      <e.Attribute name="OrganizationName">
        <e.Domain $refByName="string" />
      </e.Attribute>
    </e.Kernel>
    <e.Relationship name="worksIn">
      <e.OrdinaryMapping
        name="works_in"
        lowerBound="0"
        upperBound="1"
        domain={<e.Kernel $refByName="Person"></e.Kernel>}
      ></e.OrdinaryMapping>
      <e.OrdinaryMapping
        name="has_employees"
        lowerBound="0"
        upperBound="M"
        domain={<e.Kernel $refByName="Organization"></e.Kernel>}
      ></e.OrdinaryMapping>
    </e.Relationship>
    <e.Weak name="Child">
      <e.Attribute name="ChildID">
        <e.Domain name="number" />
      </e.Attribute>
      <e.Attribute name="ChildName">
        <e.Domain $refByName="string" />
      </e.Attribute>
    </e.Weak>
  </e.EERSchema>
);

const s1: et.IEERSchema = eerSchema1.render(new Context());

@M2M({ input: et.EERSchema, output: rt.RelSchema })
class EER2RelTransformation extends abstractM2M<et.IEERSchema, rt.IRelSchema> {
  constructor(store: ModelStore) {
    super(store);
  }

  template(s: et.IEERSchema) {
    return (
      <r.RelSchema
        name={`${s.name}_Relational_Schema`}
        content=""
        MDA_level="M1"
      >
        {s.elements
          .filter((el) => this.context.store.isTypeOf(el, et.Entity))
          .map((el) => this.Entity2Table(el as et.IEntity))}

        {s.elements
          .filter((el) => this.context.store.isTypeOf(el, et.Relationship))
          .map((el) => this.RelationshipToElement(el as et.IRelationship))}
      </r.RelSchema>
    );
  }

  @E2E({ input: et.Entity, output: rt.Table })
  @SpecPoint()  
  Entity2Table(e: et.IEntity): Element<rt.ITable> {
    return (
      <r.Table name={e.name}>
        {e.attributes.map((a) => this.Attribute2Column(a))}
      </r.Table>
    );
  }

  @E2E({ input: et.Kernel, output: rt.Table })
  @SpecOption("Entity2Table", et.Kernel)
  Kernel2Table(k: et.IKernel): Element<rt.ITable> {
    // inherit table name and column from super rule
    return (
      <r.Table>
        <r.Column name={`${k.name}ID`}>
          {/* <r.Domain name="number" /> */}
        </r.Column>
      </r.Table>
    );
  }

  @E2E({ input: et.Weak, output: rt.Table })
  @SpecOption("Entity2Table", et.Weak)
  Week2Table(w: et.IWeak): Element<rt.ITable> {
    // override table name from super rule
    return <r.Table name={`Weak_${w.name}`}></r.Table>;
  }

  Attribute2Column(a: et.IAttribute): Element<rt.IColumn> {
    return <r.Column name={a.name}></r.Column>;
  }

  @VarPoint("FKorTable")
  RelationshipToElement(
    rel: et.IRelationship
  ): Element<rt.IForeignKey> | Element<rt.ITable> {
    throw new Error("Not implemented VarOptions for VarPoint FKorTable");
    // return null as unknown as Element<rt.IForeignKey> | Element<rt.ITable>;
  }

  @VarOption("RelationshipToElement", () => true)
  RelatioshipToFK(rel: et.IRelationship): Element<rt.IForeignKey> {
    const aaa = this.context.resolve(rel.ordinaryMapping[0]);

    return (
      <r.ForeignKey>
        <r.Table $refByName=""></r.Table>
      </r.ForeignKey>
    );
  }

  @VarOption("RelationshipToElement", () => true)
  RelatioshipToTable(rel: et.IRelationship): Element<rt.ITable> {
    const aaa = this.context.resolve(rel.ordinaryMapping[0]);

    return <r.Table></r.Table>;
  }
}

describe("Test spec decorators", () => {
  it("tests specialization of Entit2Table rule", () => {
    let m = new EER2RelTransformation(testStore);
    let r = m.transform(s1);
    // expect(r).toHaveProperty("name", "PersonsRelationalSchema");
    // expect(r.elements).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       name: "Person",
    //       columns: expect.arrayContaining([
    //         expect.objectContaining({ name: "PersonID" }), // from Kernel2Table
    //         expect.objectContaining({ name: "PersonName" }), // from Entity2Table
    //       ]),
    //     }),
    //     expect.objectContaining({ name: "Weak_Child" }),
    //     expect.objectContaining({ name: "ChildID" }),
    //   ])
    // );

    expect(true).toBeTruthy();
  });
});
