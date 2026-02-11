/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)



import { hm } from "../../jsx/handle";
import { VarPoint, VarOption } from "../../variability/var-decorators";
import * as et from "../../test/eer-model/EER.meta.model.type";
import * as rt from "../../test/relational-model/REL.meta.model.type.v2";
import * as e from "../../test/eer-model/EER-components";
import * as r from "../../test/relational-model/REL-components.v2";
import { abstractM2M } from "../../transformations/abstractM2M";
import { Element, Resolve } from "../../jsx/element";
import { Context } from "../../jsx/context";
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../../index";
import * as dm from "../3.transformation-configuration/transformation-configuration-meta.model"; // import decision model types for decision model transformation
import { IPrimaryKeyStrategy, INamingConvention, IRelationshipTransformationConfiguration } from "./04-decision-types";

const testStore = new ModelStore();
const ctx = new Context();

@M2M({ input: et.EERSchema, output: rt.RelSchema })
class EER2RelDomainWithDecisionTransformation extends abstractM2M<et.IEERSchema, rt.IRelSchema, {}, dm.ITransformationConfigurationModel> {
  constructor(store: ModelStore, { }, decisionModel?: dm.ITransformationConfigurationModel) {
    super(store, {}, decisionModel);
  }

  template(s: et.IEERSchema) {
    return (
      <r.RelSchema
        name={`${s.name}_Relational_Schema_with_Decision_Model`}
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

  // @E2E({
  //   input: et.Entity,
  //   output: rt.Table,
  //   ruleName: "Entity2Table"
  // })
  Entity2Table(e: et.IEntity): Element<rt.ITable> {
    return (
      <r.Table name={e.name}>
        {e.attributes.map((a) => this.Attribute2Column(a))}
      </r.Table>
    );
  }

  @VarPoint()
  CreatePrimaryKey(e: et.IEntity): void {
  }

  @VarOption("CreatePrimaryKey", (configuration: IPrimaryKeyStrategy): boolean => {
    return configuration.AutoIncrement.isSelected;
  })
  CreateAutoIncrementPrimaryKey(e: et.IEntity): void {

  }

  @VarOption("CreatePrimaryKey", (configuration: IPrimaryKeyStrategy): boolean => {
    return configuration.UUID.isSelected;
  })
  CreateUUIDPrimaryKey(e: et.IEntity): void {

  }

  @VarOption("CreatePrimaryKey", (configuration: IPrimaryKeyStrategy): boolean => {
    return configuration.Sequence.isSelected;
  })
  CreateSequencePrimaryKey(e: et.IEntity): void {

  }

  @VarPoint()
  transformNameByNamingConvention(name: string): string {
    return name;
  }

  @VarOption("transformNameByNamingConvention", (configuration: INamingConvention): boolean => {
    return configuration.CamelCase.isSelected;
  })
  transformNameByCamelCaseNamingConvention(name: string): string {
    return name.replace(/_/g, "");
  }

  @VarOption("transformNameByNamingConvention", (configuration: INamingConvention): boolean => {
    return configuration.SnakeCase.isSelected;
  })
  transformNameBySnakeCaseNamingConvention(name: string): string {
    return name.replace(/_/g, "");
  }




  // @E2E({ input: et.Attribute, output: rt.Column })
  Attribute2Column(a: et.IAttribute): Element<rt.IColumn> {
    return <r.Column name={a.name} isKey={a.isKey}></r.Column>;
  }

  // @E2E({ input: et.Attribute, output: rt.Column })
  Attribute2PKColumn(a: et.IAttribute, ownerTable: rt.ITable): Element<rt.IColumn> {
    return <r.Column name={`fk_${a.name}`} isKey={true} ownerTable={<r.Table $refByName={ownerTable.name}></r.Table>}></r.Column >;
  }

  // @E2E({ input: et.Attribute, output: rt.ForeignKeyColumn })
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

  @VarPoint()
  RelationshipToElement(
    rel: et.IRelationship
  ): Element<rt.IForeignKey> | Element<rt.ITable> {
    throw new Error("Not implemented VarOptions for VarPoint FKorTable");
    // return null as unknown as Element<rt.IForeignKey> | Element<rt.ITable>;
  }

  // TODO Input for this rule expression should be DecisionForElement OR array of SelectedOption
  @VarOption("RelationshipToElement", (configuration: IRelationshipTransformationConfiguration): boolean => {
    return !!configuration.OneToManyImplement?.ForeignKey.isSelected;
  })
  RelatioshipToFK(rel: et.IRelationship): Element<rt.IForeignKey> {
    // const aaa = this.context.resolve(rel.ordinaryMapping[0]);

    return (
      <r.ForeignKey >
        <r.Table $refByName=""></r.Table>
      </r.ForeignKey >
    );
  }

  // TODO Type of decision should be defined by type of element (e.g. Relationship, Entity, etc.) or by specific element (e.g. RelationshipWorksIn, etc.)
  @VarOption("RelationshipToElement", (configuration: IRelationshipTransformationConfiguration): boolean => {
    return !!configuration.OneToManyImplement?.JoinTable.isSelected;
  })
  RelatioshipToTable(rel: et.IRelationship): Element<rt.ITable> {
    const codomain = et.getCodomain(rel.ordinaryMappings[0]);
    const domain = et.getInverse(rel.ordinaryMappings[0]);

    return <r.Table name="RelationshipToElement table"></r.Table >;
  }
}
