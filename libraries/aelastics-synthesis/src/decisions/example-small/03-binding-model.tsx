/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"

import { BindingModel, Binding } from "../2.binding-model/binding-meta.model-components"
import { Model, Element } from "../../types-metamodel/models-component"
import { DecisionModel, ElementIssue } from "../1.decision-model/decision-meta.model-components"


export const ER_Bindings = (store: ModelStore) => (
  <BindingModel
    name="ER_Bindings"
    description="Binding EER Model concepts to relation schema design issues"
    sourceModel={<Model $refByName="//www.aelastics.org/ERMetamodel" />}
    decisionModel={<DecisionModel $refByName="//www.aelastics.org/RelationSchemaDesign" />}
  >
    <Binding
      name="PKStrategyBinding"
      description="Binding Primary Key Strategy to EER Model"
      element={<Element $refByName="//www.aelastics.org/ERMetamodel/Entity" />}
      issues={[
        <ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesign/PrimaryKeyStrategy" />,
      ]}
    />

    <Binding
      name="OneToManyBinding"
      description="Binding 1:N Relationship Strategy to EER Model"
      element={<Element $refByName="//www.aelastics.org/CompanySchema/Relationship" />}
      issues={[
        <ElementIssue $refByName="//www.aelastics.org/RelationSchemaDesign/OneToManyStrategy" />,
      ]}

      condition='return (e) => {
                if (!e.roles || e.roles.length !== 2) return false;
                const m1 = e.roles[0];
                const m2 = e.roles[1];
                return (m1.ub === "1" && m1.lb === "0" && m2.ub === "M") ||
                       (m1.ub === "M" && m2.ub === "1" && m2.lb === "0");
            }'
    />
  </BindingModel>
)
