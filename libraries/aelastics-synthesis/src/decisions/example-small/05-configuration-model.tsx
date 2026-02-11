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

export const transformationConfigurationModel = (store: ModelStore) => (
  <ConfigurationModel name="CompanySchemaConfig"
                      sourceModel={<Model $refByName="//www.aelastics.org/CompanySchema" />}
                      bindingModel={<BindingModel $refByName="//www.aelastics.org/ER_Bindungs" />}
                      store={store}>
    <GlobalChoice
      choices={[
        <Choice
          issue={<ModelIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/NamingConvention" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesignIssues/CamelCase" />}
        />,
      ]}
    />

    <ElementChoice
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Person" />}
      choices={[
        <Choice
          issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/PrimaryKeyStrategy" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesignIssues/Auto_Increment" />}
        />,
      ]}
    />

    <ElementChoice
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Employment" />}
      choices={[
        <Choice
          issue={<ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/OneToManyImplement" />}
          selectedOption={<Option $refByName="//www.aelastics.org/RelationSchemaDesignIssues/JoinTable" />}
        />,
      ]}
    />


  </ConfigurationModel>
)