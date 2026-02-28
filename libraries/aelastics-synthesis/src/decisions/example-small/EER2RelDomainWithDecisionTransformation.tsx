/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)


import { hm } from "../../jsx/handle"
import { VarPoint, VarOption, Default } from "../../variability/var-decorators"
import { Option, And, Not, Or } from "./../../variability/eval-operators"
import {
  IEntity,
  IEERSchema,
  EERSchema,
  IAttribute,
  IRelationship,
  IOrdinaryMapping,
  Relationship,
  Entity,
  IDomain
} from "../../test/eer-model/EER.meta.model.type"
import { IColumn, ITable, IForeignKey, IRelSchema, RelSchema as RSchema, Table} from "../../test/relational-model/REL.meta.model.type.v2"
import { abstractM2M } from "../../transformations/abstractM2M"
import { Element, Resolve } from "../../jsx/element"
import { Context } from "../../jsx/context"
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../../index"
import * as cm from "./../3.configuration-model/configuration-meta.model"

import { RelSchema, Table as Tble, Column } from "./../09-relational-schema/REL-components"
import * as dm from "./../1.decision-model/decision-meta.model"

const testStore = new ModelStore()
const ctx = new Context()

@M2M({ input: EERSchema, output: RSchema })
class EER2RelDomainWithDecisionTransformation extends abstractM2M<IEERSchema, IRelSchema, {}, cm.IConfigurationModel> {
  constructor(store: ModelStore, {}, configModel?: cm.IConfigurationModel) {
    super(store, {}, configModel)
  }

  template(s: IEERSchema) {
    return (
      <RelSchema
        name={`${s.name}_Relational_Schema_with_Decision_Model`}
        content=""
        MDA_level="M1"
      >
        {s.elements
          .filter((el) => this.context.store.isTypeOf(el, Entity))
          .map((el) => this.Entity2Table(el as IEntity))}

        {s.elements
          .filter((el) => this.context.store.isTypeOf(el, Relationship))
          .map((r) => this.RelationshipMapping(r as IRelationship))}
      </RelSchema>
    )
  }

  @E2E({
    input: Entity,
    output: Table,
    ruleName: "Entity2Table",
  })
  Entity2Table(e: IEntity): Element<ITable> {
    return (
      <Tble name={this.applyNaming(e.name)}>
        {e.attributes.map((a) => this.Attribute2Column(a))}
      </Tble>
    )
  }

  // @E2E({ input: Attribute, output: Column })
  Attribute2Column(a: IAttribute): Element<IColumn> {
    return <Column name={a.name} isKey={a.isKey}></Column>
  }


  // Note: E2E doesn't support union types, so we use a base type here for tracing
  @E2E({ input: Relationship, output: Table, ruleName: "RelationshipMapping" })
  @VarPoint("OneToManyStrategy")
  RelationshipMapping(
    rel: IRelationship,
  ): Element<IColumn> | Element<ITable> {
    throw new Error("Not implemented VarOptions for VarPoint RelationshipMapping")
    // return null as unknown as Element<IForeignKey> | Element<ITable>;
  }

  @Default()
  @VarOption("RelationshipMapping", Option("ForeignKey"))
  relationshipAsForeignKey(rel: IRelationship): Element<IColumn> {
    const fkSide = this.getFKSide(rel)
    const pkSide = this.getPKSide(rel)

    return (
      <Column name={this.applyNaming(pkSide.domain.name + "Id")}
              type={this.getColumnType(pkSide.domain)}
              isForeignKey={true}
              isKey={false}
              references={pkSide.domain.name}
              isNullable={fkSide.lb === "0"}
      />
    )
  }

  @VarOption("RelationshipMapping", Option("JoinTable"))
  relationshipAsJoinTable(rel: IRelationship): Element<ITable> {
    const role1 = rel.roles[0]
    const role2 = rel.roles[1]

    return <Tble name={this.applyNaming(rel.name)}>
      <Column
        name={this.applyNaming(role1.domain.name + "Id")}
        type={this.getColumnType(role1)}
        isForeignKey={true}
        references={role1.name}
        isNullable={role1.lb !== "1"}
        isKey={role1.ub === "1"}
      />
      <Column
        name={this.applyNaming(role2.domain.name + "Id")}
        type={this.getColumnType(role2)}
        isForeignKey={true}
        references={role2.name}
        isNullable={role2.lb !== "1"}
        isKey={role2.ub === "1"}
      />
      <Column />
    </Tble>
  }

  // ######### START PrimaryKeyStrategy variations #############

  @VarPoint("PrimaryKeyStrategy")
  primaryKeyStrategy(e: IEntity): void {
  }

  @VarOption("primaryKeyStrategy", Option("AutoIncrement"))
  primaryKeyAutoIncrement(e: IEntity): void {
  }

  @VarOption("primaryKeyStrategy", Option("UUID"))
  primaryKeyUUID(e: IEntity): void {
  }

  @VarOption("primaryKeyStrategy", Option("Sequence"))
  primaryKeySequence(e: IEntity): void {
  }

  // ######### END PrimaryKeyStrategy variations #############

  // ######### START NamingConvention variations #############
  @VarPoint("NamingConvention")
  applyNaming(name: string): string {
    return name
  }

  @VarOption("applyNaming", Option("CamelCase"))
  applyCamelCaseNaming(name: string): string {
    return name.replace(/_/g, "")
  }

  @VarOption("applyNaming", Option("SnakeCase"))
  applySnakeCaseNaming(name: string): string {
    return name.replace(/_/g, "")
  }

  // ######### END NamingConvention variations #############

  private getFKSide(rel: IRelationship): IOrdinaryMapping {
    // Return the side with upperBound = 1 (many-to-one side becomes FK side)
    return rel.roles.find(m => m.ub === "1") || rel.roles[0]
  }

  private getPKSide(rel: IRelationship): IOrdinaryMapping {
    // Return the side with upperBound = N (one-to-many side becomes PK side)
    return rel.roles.find(m => m.ub !== "1") || rel.roles[1]
  }

  private getColumnType(domain: IDomain): string {
    // Map EER domain types to relational column types
    const domainName = domain.name.toLowerCase()

    switch (domainName) {
      case "string":
        return "VARCHAR(255)"
      case "number":
      case "integer":
      case "int":
        return "INTEGER"
      case "float":
      case "double":
        return "DOUBLE"
      case "boolean":
      case "bool":
        return "BOOLEAN"
      case "date":
        return "DATE"
      case "datetime":
      case "timestamp":
        return "TIMESTAMP"
      case "text":
        return "TEXT"
      case "bigint":
        return "BIGINT"
      default:
        return "VARCHAR(255)" // Default fallback
    }
  }


}
