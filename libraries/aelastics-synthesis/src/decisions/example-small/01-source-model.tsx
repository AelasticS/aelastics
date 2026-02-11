/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import { EERSchema, Attribute, Domain, Relationship, Role, Entity } from "../../test/eer-model/EER-components"

export const CompanySchema = (store: ModelStore) => {
  return (
    <EERSchema name="CompanySchema" MDA_level="M1" store={store}>
      <Entity name="Person">
        <Attribute name="personId" isKey={true}>
          <Domain name="number" />
        </Attribute>
        <Attribute name="firstName" isKey={false}>
          <Domain name="string" />
        </Attribute>
        <Attribute name="lastName" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
      </Entity>

      <Entity name="Company">
        <Attribute name="companyId" isKey={true}>
          <Domain $refByName="number" />
        </Attribute>
        <Attribute name="companyName" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
        <Attribute name="address" isKey={false}>
          <Domain $refByName="string" />
        </Attribute>
      </Entity>

      {/* 0:1 to 0:M Relationship: Person works in Company */}
      <Relationship name="Employment">
        <Role
          name="WorksIn"
          lowerBound="0"
          upperBound="1"
          domain={<Entity $refByName="Company"></Entity>}
        />
        <Role
          name="Hires"
          lowerBound="0"
          upperBound="M"
          domain={<Entity $refByName="Person"></Entity>}
        />
      </Relationship>

    </EERSchema>
  )
}
