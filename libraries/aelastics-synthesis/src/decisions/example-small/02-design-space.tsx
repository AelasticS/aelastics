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
    name="RelationSchemaDesignIssues"
    description="Design space for persistence strategies"
    store={store}
  >
    <ElementIssue name="OneToManyImplement" description="How to implement 1:N relationships">
      <Option name="ForeignKey" description="Use Foreign Key in the Many side table" isDefault={true}
              optionType={<SimpleOption name="StrategyFK" />}
      />
      <Option name="JoinTable" description="Use a separate join table"
              optionType={<SimpleOption name="StrategyJoinTable" />}
      />
    </ElementIssue>
    <ElementIssue name="PrimaryKeyStrategy" description="How to generate primary keys">
      <Option name="Auto_Increment" description="Database auto increment" isDefault={true}
              optionType={<SimpleOption name="PK_AutoIncrement" />}
      />
      <Option name="UUID" description="Use UUID strings"
              optionType={<SimpleOption name="PK_UUID" />}
      />
      <Option name="Sequence" description="Use database sequence"
              optionType={<SimpleOption name="PK_Sequence" />}
      />
    </ElementIssue>
    <ModelIssue name="NamingConvention" description="How to name the database tables">
      <Option name="CamelCase" description="Use camelCase for table names" isDefault={true}
              optionType={<SimpleOption name="Naming_CamelCase" />}
      />
      <Option name="SnakeCase" description="Use snake_case for table names"
              optionType={<SimpleOption name="Naming_SnakeCase" />}
      />
    </ModelIssue>
  </DecisionModel>
)
