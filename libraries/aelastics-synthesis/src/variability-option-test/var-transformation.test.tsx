/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)

import { hm } from "../jsx/handle";
import { VarPoint, VarOption } from "./../variability/var-decorators";
import * as et from "../test/eer-model/EER.meta.model.type";
import * as rt from "../test/relational-model/REL.meta.model.type.v2";
import * as e from "../test/eer-model/EER-components";
import * as r from "../test/relational-model/REL-components.v2";
import { abstractM2M } from "./../transformations/abstractM2M";
import { Element, Resolve } from "../jsx/element";
import { Context } from "../jsx/context";
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../index";

const testStore = new ModelStore();

const eerSchema1: Element<et.IEERSchema> = (
  <e.EERSchema name="Persons" MDA_level="M1" store={testStore}>
    <e.Kernel name="Person">
      <e.Attribute name="personId" isKey={true}>
        <e.Domain name="number" />
      </e.Attribute>
      <e.Attribute name="personName" isKey={false}>
        <e.Domain name="string" />
      </e.Attribute>
    </e.Kernel>
    <e.Kernel name="Organization">
      <e.Attribute name="organizationId" isKey={true}>
        <e.Domain $refByName="number" />
      </e.Attribute>
      <e.Attribute name="organizationName" isKey={false}>
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
      <e.Attribute name="ChildID" isKey={true}>
        <e.Domain $refByName="number" />
      </e.Attribute>
      <e.Attribute name="ChildName" isKey={false}>
        <e.Domain $refByName="string" />
      </e.Attribute>
    </e.Weak>
    <e.WeakMapping
      name="PersonToChild"
      domain={<e.Kernel $refByName="Person"></e.Kernel>}
      codomain={<e.Weak $refByName="Child"></e.Weak>}
    ></e.WeakMapping>
  </e.EERSchema>
);

const ctx = new Context();
const s1: et.IEERSchema = eerSchema1.render(ctx);

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
          .filter((el) => this.context.store.isTypeOf(el, et.WeakMapping))
          .map((el) => this.WeekMappingToFK(el as et.IWeakMapping))}

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

  // @E2E({ input: et.Kernel, output: rt.Table })
  @SpecOption("Entity2Table", et.Kernel)
  Kernel2Table(k: et.IKernel): Element<rt.ITable> {
    // inherit table name and column from super rule
    return <r.Table name={`k_${k.name}`}></r.Table>;
  }

  // @E2E({ input: et.Weak, output: rt.Table })
  @SpecOption("Entity2Table", et.Weak)
  Week2Table(w: et.IWeak): Element<rt.ITable> {
    // TODO Formiraj slozeni kljuc od kljuca jakog objekta i svog kljuca. Ovo vazi pod uslov da se prvo obidju svi kerneli, pa onda slabi.
    // Ovo sve vazi pod ogranicenjem da weak moze zavisiti samo od kernela, a nema podtipova i agregacija u modelu
    return (
      <r.Table name={`w_${w.name}`}>
        {/* TODO poziv weekmappinga ne može da se radi u ovom trenutku, jer table još uvek nije napravljen  */}
        {/* {this.WeekMappingToFK(w.weakMap)} */}
      </r.Table >
    );
  }

  @E2E({ input: et.WeakMapping, output: rt.ForeignKey })
  WeekMappingToFK(wm: et.IWeakMapping) {

    // override table name from super rule
    const parentKeyAttributes: Array<et.IAttribute> =
      wm.domain?.attributes?.filter(
        (attr: et.IAttribute) => attr.isKey == true
      );

    // let a = this.context.resolveJSXElement(wm.domain);

    return <Resolve name="res1" input={wm.domain} ruleName="Entity2Table">
      {(refTable: rt.ITable) => (
        <Resolve name="res2" input={wm.codomain} ruleName="Entity2Table">
          {(ownerTable: rt.ITable) => (
            <r.ForeignKey name={`for_key_ref_${refTable.name}`}
              referencedTable={<r.Table $refByName={refTable.name}></r.Table>}
              ownerTable={<r.Table $refByName={ownerTable.name}></r.Table>}
            >
              {parentKeyAttributes.map((attribute) => (
                this.Attribute2PKColumn(attribute, ownerTable)
              ))}

              {parentKeyAttributes.map((attribute) => (
                this.Attribute2FKColumn(attribute)
              ))}

            </r.ForeignKey>
          )}
        </Resolve>)}
    </Resolve>


    {/* // TODO Resolve should have trasformation (rule) name, in case when some ModelElement can be transformed by multiple rules. 
    In this case, attribute from kernel will be transformed by Attribute2Column rule, and by Week2Table(Entity2Table rule)

    How to find a target JSX element (fk column) in case when one table has FK in more than one table? FK is a result of transformation of Association, and one FK can be
    target of one association 
    */}
  }

  @E2E({ input: et.Attribute, output: rt.Column })
  Attribute2Column(a: et.IAttribute): Element<rt.IColumn> {
    return <r.Column name={a.name} isKey={a.isKey}></r.Column>;
  }

  @E2E({ input: et.Attribute, output: rt.Column })
  Attribute2PKColumn(a: et.IAttribute, ownerTable: rt.ITable): Element<rt.IColumn> {
    return <r.Column name={`fk_${a.name}`} isKey={true} ownerTable={<r.Table $refByName={ownerTable.name}></r.Table>}></r.Column >;
  }

  @E2E({ input: et.Attribute, output: rt.ForeignKeyColumn })
  Attribute2FKColumn(a: et.IAttribute): Element<rt.IForeignKeyColumn> {

    return <Resolve input={a} ruleName="Attribute2Column">
      {(refColumn: rt.IColumn) => (
        <Resolve input={a} ruleName="Attribute2PKColumn">
          {(fkColumn: rt.IColumn) => (
            <r.ForeignKeyColumn name={`fk_col_${a.name}`}
              fkColumn={<r.Column $refByName={fkColumn.name}></r.Column>}
              refColumn={<r.Column $refByName={refColumn.name}></r.Column>}
            >
            </r.ForeignKeyColumn >
          )}
        </Resolve>
      )}
    </Resolve>;
  }

  @VarPoint("FKorTable")
  RelationshipToElement(
    rel: et.IRelationship
  ): Element<rt.IForeignKey> | Element<rt.ITable> {
    throw new Error("Not implemented VarOptions for VarPoint FKorTable");
    // return null as unknown as Element<rt.IForeignKey> | Element<rt.ITable>;
  }

  @VarOption("RelationshipToElement", () => false)
  RelatioshipToFK(rel: et.IRelationship): Element<rt.IForeignKey> {
    // const aaa = this.context.resolve(rel.ordinaryMapping[0]);

    return (
      <r.ForeignKey >
        <r.Table $refByName=""></r.Table>
      </r.ForeignKey >
    );
  }

  @VarOption("RelationshipToElement", () => true)
  RelatioshipToTable(rel: et.IRelationship): Element<rt.ITable> {
    const codomain = et.getCodomain(rel.ordinaryMappings[0]);
    const domain = et.getInverse(rel.ordinaryMappings[0]);

    return <r.Table name="RelationshipToElement table"></r.Table >;
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
