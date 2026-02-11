/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"

import { BindingModel, Bind } from "../2.binding-model/binding-meta.model-components"
import { Model, Element } from "../../types-metamodel/models-component"
import { DecisionModel, ElementIssue } from "../1.decision-model/decision-meta.model-components"


export const ER_Bindings = (store: ModelStore) => (
  <BindingModel
    name="ER_Bindungs"
    description="Binding EER Model concepts to relation schema design issues"
    sourceModel={<Model $refByName="//www.aelastics.org/ERMetamodel" />}
    decisionModel={<DecisionModel $refByName="//www.aelastics.org/RelationSchemaDesignIssues" />}
  >
    <Bind
      name="PKStrategyBinding"
      description="Binding Primary Key Strategy to EER Model"
      element={<Element $refByName="//www.aelastics.org/ERMetamodel/Entity" />}
      issues={[
        <ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/PrimaryKeyStrategy" />,
      ]}
    />

    <Bind
      name="OneToManyBinding"
      description="Binding 1:N Relationship Strategy to EER Model"
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Relationship" />}
      issues={[
        <ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesignIssues/OneToManyImplement" />,
      ]}

      condition='return (e) => {
                if (!e.ordinaryMappings || e.ordinaryMappings.length !== 2) return false;
                const m1 = e.ordinaryMappings[0];
                const m2 = e.ordinaryMappings[1];
                return (m1.upperBound === "1" && m1.lowerBound === "0" && m2.upperBound === "M") || 
                       (m1.upperBound === "M" && m2.upperBound === "1" && m2.lowerBound === "0");
            }'
    />

  </BindingModel>
)
