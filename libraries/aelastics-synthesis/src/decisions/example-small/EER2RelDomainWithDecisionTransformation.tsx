/** @jsx createExprNode */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)

import { createExprNode } from "../../jsx/handle"
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
  IDomain,
  Attribute,
} from "../../test/eer-model/EER.meta.model.type"
import * as rmT from "./../09-relational-schema/REL.meta.model.type"
import { abstractM2M } from "../../transformations/abstractM2M"
import { ExprNode, Resolve } from "../../jsx/element"
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../../index"
import * as cm from "./../3.configuration-model/configuration-meta.model"

import { RelSchema, Table, Column } from "./../09-relational-schema/REL-components"

@M2M()
export class EER2RelDomainWithDecisionTransformation extends abstractM2M<
  IEERSchema,
  rmT.IRelSchema,
  {},
  cm.IConfigurationModel
> {
  constructor(store: ModelStore, {}, configModel?: cm.IConfigurationModel) {
    super(store, {}, configModel)
  }

  template(s: IEERSchema) {
    return (
      <RelSchema name={`${s.name}_Relational_Schema_with_Decision_Model`} content="" MDA_level="M1" store={this.context.store}>
        {s.elements
          .filter((el) => this.context.store.isTypeOf(el, Entity))
          .map((el) => this.Entity2Table(el as IEntity))}

        {s.elements
          .filter((el) => this.context.store.isTypeOf(el, Relationship))
          .map((r) => this.RelationshipMapping(r as IRelationship))}
      </RelSchema>
    )
  }

  @E2E()
  Entity2Table(e: IEntity): ExprNode<rmT.ITable> {
    return <Table name={this.applyNaming(e.name)}>{e.attributes.map((a) => this.Attribute2Column(a))}</Table>
  }

  /*

<TraceEntry
      source={<ModelElement $refByName={a.name} />}
      targets={[<ModelElement $refByName={a.name} />]}
      rule={target.constructor.name}
      ruleType={this.context.lastVarResolution?.ruleType || "RegularRule"}
    />



  */
  @E2E()
  Attribute2Column(a: IAttribute): ExprNode<rmT.IColumn> {
    return <Column name={this.applyNaming(a.name)} isKey={a.isKey} isAutoincrement={this.primaryKeyStrategy(a)} type={this.getColumnType(a.attrDomain)}></Column>
  }

  // @E2E is outermost: wraps the VarPoint dispatcher, so tracing happens after VarPoint selects
  // and calls the matching VarOption method. @VarPoint must be inner (applied first) so it
  // registers its options bucket in the registry before @VarOption decorators run on later methods.
  @E2E()
  @VarPoint("OneToManyStrategy")
  RelationshipMapping(rel: IRelationship): ExprNode<rmT.IColumn> | ExprNode<rmT.ITable> {
    throw new Error("Not implemented VarOptions for VarPoint RelationshipMapping")
    // return null as unknown as ExprNode<IForeignKey> | ExprNode<ITable>;
  }

  @Default()
  @VarOption("RelationshipMapping", Option("ForeignKey"))
  relationshipAsForeignKey(rel: IRelationship): ExprNode<rmT.IColumn> {
    const fkSide = this.getFKSide(rel)
    const pkSide = this.getPKSide(rel)

    return (
      <Table $refByName={this.applyNaming(pkSide.domain.name)}>
        <Column
          name={this.applyNaming(fkSide.domain.name + "Id_FK")}
          type={this.getColumnType(fkSide.domain)}
          isForeignKey={true}
          isKey={false}
          references={fkSide.domain.name}
          isNullable={fkSide.lb === "0"}
        />
      </Table>
    )
  }

  @VarOption("RelationshipMapping", Option("JoinTable"))
  relationshipAsJoinTable(rel: IRelationship): ExprNode<rmT.ITable> {
    const role1 = rel.roles[0]
    const role2 = rel.roles[1]

    return (
      <Table name={this.applyNaming(rel.name)}>
        <Column
          name={this.applyNaming(role1.domain.name + "Id_FK")}
          type={this.getColumnType(role1)}
          isForeignKey={true}
          references={role1.domain.name}
          isNullable={role1.lb !== "1" && role1.ub !== "1"}
          isKey={role1.ub === "1"}
        />
        <Column
          name={this.applyNaming(role2.domain.name + "Id_FK")}
          type={this.getColumnType(role2)}
          isForeignKey={true}
          references={role2.domain.name}
          isNullable={role2.lb !== "1"}
          isKey={role2.ub === "1"}
        />
      </Table>
    )
  }

  // ######### START PrimaryKeyStrategy variations #############

  @VarPoint("PrimaryKeyStrategy")
  primaryKeyStrategy(a: IAttribute): boolean {
    throw new Error("Not implemented VarOptions for VarPoint PrimaryKeyStrategy")
  }

  @VarOption("primaryKeyStrategy", Option("UseAutoIncrement"))
  useAutoIncrement(a: IAttribute): boolean {
    return a.isKey ? true : false
  }

  @VarOption("primaryKeyStrategy", Option("UseManualIncrement"))
  useManualIncrement(a: IAttribute): boolean {
    return false
  }

  // ######### END PrimaryKeyStrategy variations #############

  // ######### START NamingConvention variations #############
  @VarPoint("NamingConvention")
  applyNaming(name: string): string {
    throw new Error("Not implemented VarOptions for VarPoint NamingConvention")
  }

  @VarOption("applyNaming", Option("CamelCase"))
  applyCamelCaseNaming(name: string): string {
    return name.replace(/_/g, "")
  }

  @VarOption("applyNaming", Option("SnakeCase"))
  applySnakeCaseNaming(name: string): string {
    return name
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      .toLowerCase()
  }

  // ######### END NamingConvention variations #############

  private getFKSide(rel: IRelationship): IOrdinaryMapping {
    // Return the side with upperBound = 1 (many-to-one side becomes FK side)
    return rel.roles.find((m) => m.ub === "1") || rel.roles[0]
  }

  private getPKSide(rel: IRelationship): IOrdinaryMapping {
    // Return the side with upperBound = N (one-to-many side becomes PK side)
    return rel.roles.find((m) => m.ub !== "1") || rel.roles[1]
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
