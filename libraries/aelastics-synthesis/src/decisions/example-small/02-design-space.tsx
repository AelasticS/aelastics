/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import {
  DecisionModel,
  ElementIssue,
  ModelIssue,
  Option,
  SimpleOption,
} from "../1.decision-model/decision-meta.model-components"

export const RelationSchemaDesignIssues = (store: ModelStore) => (
  <DecisionModel
    name="RelationSchemaDesign"
    description="Design space for persistence strategies"
    store={store}
  >
    <ElementIssue name="OneToManyStrategy" description="How to implement 1:N relationships">
      <Option name="ForeignKey" description="Use Foreign Key in the Many side table" isDefault={true}
        optionType={<SimpleOption name="FK" />}
      />
      <Option name="JoinTable" description="Use a separate join table"
        optionType={<SimpleOption name="JoinTable" />}
      />
    </ElementIssue>
    <ElementIssue name="PrimaryKeyStrategy" description="How to generate primary keys">
      <Option name="AutoIncrement" description="Database auto increment" isDefault={true}
        optionType={<SimpleOption name="PK_AutoInc" />}
      />
      <Option name="UUID" description="Use UUID strings"
        optionType={<SimpleOption name="PK_UUID" />}
      />
      <Option name="Sequence" description="Use database sequence"
        optionType={<SimpleOption name="PK_Seq" />}
      />
    </ElementIssue>
    <ModelIssue name="NamingConvention" description="How to name the database tables">
      <Option name="CamelCase" description="Use camelCase for table names" isDefault={true}
        optionType={<SimpleOption name="CamelCase" />}
      />
      <Option name="SnakeCase" description="Use snake_case for table names"
        optionType={<SimpleOption name="SnakeCase" />}
      />
    </ModelIssue>
  </DecisionModel>
)
