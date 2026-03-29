/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import { TraceModel, TraceEntry, VarPointTraceEntry } from "../8.trace-model/trace-model-meta.model-components"
import { EERSchema as ERSchema, Attribute, Kernel as Entity, Relationship } from "../../test/eer-model/EER-components"
import { RelSchema, Column, Table } from "../09-relational-schema/REL-components"
import { ConfigurationModel, Choice } from "../3.configuration-model/configuration-meta.model-components"
import { ElementIssue, Option } from "../1.decision-model/decision-meta.model-components"


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
      targets={[<Table $refByName="//www.aelastics.org/CompanyRelationalSchema/person" />]}
      rule="Entity2Table"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Person/personId" />}
      targets={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/person/person_id" />]}
      rule="Attribute2Column"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Person/name" />}
      targets={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/person/name" />]}
      rule="Attribute2Column"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Entity $refByName="//www.aelastics.org/CompanySchema/Company" />}
      targets={[<Table $refByName="//www.aelastics.org/CompanyRelationalSchema/company" />]}
      rule="Entity2Table"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Company/companyId" />}
      targets={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/company/company_id" />]}
      rule="Attribute2Column"
      ruleType="RegularRule"
    />

    <TraceEntry
      source={<Attribute $refByName="//www.aelastics.org/CompanySchema/Company/companyName" />}
      targets={[<Column $refByName="//www.aelastics.org/CompanyRelationalSchema/company/company_name" />]}
      rule="Attribute2Column"
      ruleType="RegularRule"
    />

    <VarPointTraceEntry
      source={<Relationship $refByName="//www.aelastics.org/CompanySchema/Employment" />}
      targets={[<Table $refByName="//www.aelastics.org/CompanyRelationalSchema/employment" />]}
      rule="RelationshipMapping"
      ruleType="VariabilityPoint"
      variabilityOption="relationshipAsJoinTable"
      choices={[<Choice $refByName="//www.aelastics.org/CompanySchemaConfig/EmploymentJoinTableMapping/UseJoinTable"
        issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesign/OneToManyStrategy" />}
        selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesign/JoinTable" />}
      />]}
    />


  </TraceModel>
)