/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import { Model, Element } from "../../types-metamodel/models-component"

import { ElementIssue, ModelIssue, Option } from "../1.decision-model/decision-meta.model-components"
import { BindingModel } from "../2.binding-model/binding-meta.model-components"
import {
  ElementChoice,
  Choice,
  ConfigurationModel, GlobalChoice,
} from "./../3.configuration-model/configuration-meta.model-components"

export const CompanySchema_Config = (store: ModelStore) => (
  <ConfigurationModel name="CompanySchema_Config"
    sourceModel={<Model $refByName="//www.aelastics.org/CompanySchema" />}
    bindingModel={<BindingModel $refByName="//www.aelastics.org/ER_Bindungs" />}
    store={store}>
    <GlobalChoice
      choices={[
        <Choice
          issue={<ModelIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/NamingConvention" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesignIssues/CamelCase" />}
          assumptions="CamelCase improves readability and schema consistency."
          justification="It is a widely adopted convention that eases developer understanding."
          consequences="All names will follow CamelCase, potentially requiring source renames."
        />,
      ]}
    />

    <ElementChoice
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Person" />}
      choices={[
        <Choice
          issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/PrimaryKeyStrategy" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesignIssues/Auto_Increment" />}
          assumptions="Auto-increment simplifies unique identifier generation."
          justification="It is a common, widely supported strategy for ensuring uniqueness."
          consequences="Person table will use auto-increment PK, possibly needing model updates."
        />,
      ]}
    />

    <ElementChoice
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Employment" />}
      choices={[
        <Choice
          issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/OneToManyImplement" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesignIssues/JoinTable" />}
          assumptions="Join table avoids nulls; most persons in this domain are unemployed"
          justification="Join tables handle optional relationships cleanly without null values."
          consequences="A new join table will manage the Person-Employment relationship."
        />,
      ]}
    />

  </ConfigurationModel>
)





















