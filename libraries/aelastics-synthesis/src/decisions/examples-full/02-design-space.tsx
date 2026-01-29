/** @jsx hm */

import { hm } from "../../jsx/handle"
import { ModelStore } from "../../index"
import {
  CompositeOption,
  DecisionModel,
  Issue,
  Option,
  SimpleOption,
  SubIssue,
} from "../1.design-decision/design-decision-meta.model-components"
import { TypeNumber, TypeString, TypeBoolean } from "../../types-metamodel/predefined-types"

export const createPersistenceDesignSpace = (store: ModelStore) => (
  <DecisionModel
    name="Persistence_GDM"
    description="Design space for persistence strategies"
    store={store}
  >
    {/* Inlined predefined types to avoid self-reference error */}
    <TypeNumber name="number" />
    <TypeString name="string" />
    <TypeBoolean name="boolean" />

    <Issue name="TableStrategy" description="How to map inheritance to tables">
      <Option name="Single Table" description="Use single table per hierarchy" isDefault={true}
              optionType={<SimpleOption name="StrategySingleTable" />}
      />
      <Option name="Table Per Class" description="Use table per concrete class"
              optionType={<SimpleOption name="StrategyTablePerClass" />}
      />
      <Option name="Joined Table" description="Use joined table strategy"
              optionType={<SimpleOption name="StrategyJoinedTable" />}
      />
    </Issue>

    <Issue name="PrimaryKeyStrategy" description="How to generate primary keys">
      <Option name="Auto Increment" description="Database auto increment" isDefault={true}
              optionType={<SimpleOption name="PK_AutoIncrement" />}
      />
      <Option name="UUID" description="Use UUID strings"
              optionType={<SimpleOption name="PK_UUID" />}
      />
      <Option name="Sequence" description="Use database sequence"
              optionType={<SimpleOption name="PK_Sequence" />}
      />
    </Issue>

    <Issue name="ManyToManyImplement" description="How to implement M:N relationships">
      <Option name="Association Table" description="Use a separate junction table" isDefault={true}
              optionType={
                <CompositeOption name="AssocTableDetails">
                  <SubIssue name="Naming Convention" description="Naming for the association table">
                    <Option name="Concat Names" description="Table1_Table2" isDefault={true}
                            optionType={<SimpleOption name="StrategyConcatNames" />}
                    />
                    <Option name="CamelCase" description="table1Table2"
                            optionType={<SimpleOption name="StrategyCamelCase" />}
                    />
                  </SubIssue>
                </CompositeOption>
              }
      />
      <Option name="Array Column" description="Store IDs as array (No sql style)"
              optionType={<SimpleOption name="StrategyArrayColumn" />}
      />
    </Issue>

    <Issue name="OneToManyImplement" description="How to implement 1:N relationships">
      <Option name="ForeignKey" description="Use Foreign Key in the Many side table" isDefault={true}
              optionType={<SimpleOption name="StrategyFK" />}
      />
      <Option name="AssociationTableStrategy_Unique" description="Use a separate junction table"
              optionType={<SimpleOption name="StrategyAssocTable" />}
      />
    </Issue>

  </DecisionModel>
)
