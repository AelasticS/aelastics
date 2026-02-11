/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import { TraceModel, TraceEntry } from "../8.trace-model/trace-model-meta.model-components"
import { Model, Element } from "../../types-metamodel/models-component"
import { EERSchema as ERSchema, Attribute, Kernel as Entity, Relationship } from "../../test/eer-model/EER-components"
import { RelSchema, Column, Table } from "../09-relational-schema/REL-components"
import { ConfigurationModel } from "../3.configuration-model/configuration-meta.model-components"

export const traceModel = (store: ModelStore) => (
  <TraceModel name="CompanySchema_Trace"
              timestamp="2025-06-01T12:00:00Z"
              source={<ERSchema $refByName="//www.aelastics.org/CompanySchema" />}
              targets={[<RelSchema $refByName="//www.aelastics.org/CompanyRelationalSchema" />]}
              config={<ConfigurationModel $refByName={"//www.aelastics.org/CompanySchema_Config"} />}
              transformationSpec="CompanySchemaTransformation"
              store={store}>

    <TraceEntry
      source={<Entity $refByName="//www.aelastics.org/CompanySchema/Person" />}
      target={[<Table $refByName="//www.aelastics.org/CompanyRelationalSchema/Person" />]}
      rule="entityToTable"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Person/personId" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/Person/PersonId" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Person/firstName" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/Person/FirstName" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Person/lastName" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/Person/LastName" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Entity $refByName="//www.aelastics.org/CompanySchema/Company" />}
      target={[<Table $refByName="//www.aelastics.org/CompanyRelationalSchema/Company" />]}
      rule="entityToTable"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Company/companyId" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/Company/CompanyId" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Company/companyName" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/Company/CompanyName" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Company/address" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/Company/Address" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Relationship $refByName="//www.aelastics.org/CompanySchema/Employment" />}
      target={[<Table $refByName="//www.aelastics.org/CompanyRelationalSchema/WorksIn" />]}
      rule="relationshipMapping"
      ruleType="VariabilityPoint"
      variabilityOption="relationshipAsJoinTable"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Employment/personId" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/WorksIn/PersonId" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Employment/companyId" />}
      target={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/WorksIn/CompanyId" />]}
      rule="attributeToColumn"
      ruleType="RegularRule"
    />

  </TraceModel>
)