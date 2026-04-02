/** @jsx createExprNode */

import { createExprNode } from "../../jsx/handle"
import { ModelStore } from "../../index"
import { Model, Element } from "../../types-metamodel/models-component"

import { ElementIssue, GlobalIssue, Option } from "../1.decision-model/decision-meta.model-components"
import { BindingModel } from "../2.binding-model/binding-meta.model-components"
import {
  ElementChoice,
  Choice,
  ConfigurationModel, GlobalChoice,
} from "./../3.configuration-model/configuration-meta.model-components"

export const CompanySchemaConfig = (store: ModelStore) => (
  <ConfigurationModel name="CompanySchemaConfig"
    sourceModel={<Model $refByName="//www.aelastics.org/CompanySchema" />}
    bindingModel={<BindingModel $refByName="//www.aelastics.org/ER_Bindings" />}
    store={store}>
    <GlobalChoice name="CamelCaseNaming"
      choices={[
        <Choice name="UseCamelCase"
          issue={<GlobalIssue $refByName="//www.aelastics.org/RelationSchemaDesign/NamingConvention" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesign/CamelCase" />}
        />,
      ]}
    />

    <GlobalChoice name="SnakeCaseNaming"
      choices={[
        <Choice name="UseSnakeCase"
          issue={<GlobalIssue $refByName="//www.aelastics.org/RelationSchemaDesign/NamingConvention" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesign/SnakeCase" />}
        />,
      ]}
    />

    <ElementChoice name="PersonPrimaryKey"
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Person" />}
      choices={[
        <Choice name="UseAutoIncrement"
          issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesign/PrimaryKeyStrategy" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesign/AutoIncrement" />}
        />,
      ]}
    />

    <ElementChoice name="EmploymentJoinTableMapping"
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Employment" />}
      choices={[
        <Choice name="UseJoinTable"
          issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesign/OneToManyStrategy" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesign/JoinTable" />}
          assumptions="Join table avoids nulls; most persons in this domain are unemployed"
          justification="Join tables handle optional relationships cleanly without null values."
          consequences="A new join table will manage the Person-Employment relationship."
        />,
      ]}
    />

    <ElementChoice name="EmploymentForeignKeyMapping"
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Employment" />}
      choices={[
        <Choice name="UseForeignKey"
          issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesign/OneToManyStrategy" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesign/ForeignKey" />}
        />,
      ]}
    />

  </ConfigurationModel>
)
