/** @jsx createExprNode */

import { createExprNode } from "../../jsx/handle"
import { ExprNode, ModelStore } from "../../index"
import { EERSchema, Attribute, Domain, Relationship, Role, Entity } from "../../test/eer-model/EER-components"
import * as t from "./../../test/eer-model/EER.meta.model.type"

export const CompanySchema = (store: ModelStore): ExprNode<t.IEERSchema> => {
  return (
    <EERSchema name="CompanySchema" MDA_level="M1" store={store}>
      <Entity name="Person">
        <Attribute name="personId" isKey={true}>
          <Domain name="number" />
        </Attribute>
        <Attribute name="name" isKey={false}>
          <Domain name="string" />
        </Attribute>
      </Entity>
      <Entity name="Company">
        <Attribute name="companyId" isKey={true}>
          <Domain $refByName="number" />
        </Attribute>
        <Attribute name="companyName" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
      </Entity>
      {/* 0:1 to 0:M Relationship: Person works in Company */}
      <Relationship name="Employment">
        <Role
          name="WorksIn"
          lb="0"
          ub="1"
          domain={<Entity $refByName="Company"></Entity>}
        />
        <Role
          name="Hires"
          lb="0"
          ub="M"
          domain={<Entity $refByName="Person"></Entity>}
        />
      </Relationship>
    </EERSchema>
  )
}



