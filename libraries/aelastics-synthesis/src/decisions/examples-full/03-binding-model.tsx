/** @jsx hm */

import { hm } from "../../jsx/handle"
import { Element } from "../../jsx/element"
import { ModelStore } from "../../index"

import * as dbmC from "../2.modeling-language-binding/modeling-language-binding-meta.model-components"
import * as etC from "../../types-metamodel/types-components"
import * as gdmC from "../1.design-decision/design-decision-meta.model-components"

// We assume the GDM and Source Metamodel are loaded in the store
export const createBindingModel = (store: ModelStore) => (
  <dbmC.ModelingLanguageBindingModel
    name="University_Persistence_Binding"
    description="Binding University EER Model to Persistence Decisions"
    // Reference to the Metamodel of EER (not the instance 'University')
    // We bind Metamodel types (Kernel, Relationship) to Decisions
    sourceModel={<etC.TypeModel $refByName="//www.aelastics.org/aelastic-EERModel" />}
    decisionModel={<gdmC.DecisionModel $refByName="//www.aelastics.org/Persistence_GDM" />}
    store={store}
  >
    {/* Bind all Kernels (Entities) and Subtypes to PK Strategy and Table Strategy */}
    <dbmC.ModelingLanguageBindingElement
      name="EntityPersistenceStrategy"
      description="Decisions for all entities"

      // This references the 'Kernel' class in EER Metamodel
      sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Kernel" />}

      decisionIssues={[
        <gdmC.DecisionModel $refByName="//www.aelastics.org/Persistence_GDM/TableStrategy" />,
        <gdmC.DecisionModel $refByName="//www.aelastics.org/Persistence_GDM/PrimaryKeyStrategy" />,
      ]}
    />

    {/*
            Demonstrating specialized strategy for a specific level of inheritance.
            Here we target the 'Staff' entity specifically to give it a different strategy if needed.
            Since 'Staff' is an instance in the University source model, but Binding acts on Metamodel types?
            Wait, Binding connects Source Metamodel Types to GDM.
            However, we often want to bind specific instances of Source Model (e.g. "Person" entity) to decisions.
            The current binding model supports binding M2 types.
            
            To bind specific M1 elements (like 'Staff' entity), we would need a different binding mechanism or 
            condition based on the name.
            
            Let's use the condition to target "Staff".
        */}
    <dbmC.ModelingLanguageBindingElement
      name="StaffInheritanceStrategy"
      description="Specific strategy for Staff hierarchy"

      sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Subtype" />}

      decisionIssues={[
        <gdmC.DecisionModel $refByName="//www.aelastics.org/Persistence_GDM/TableStrategy" />,
      ]}

      // Condition: applies if the element name is 'Staff'
      condition='return (e) => e.name === "Staff"'
    />

    {/* Bind Many-to-Many Relationships to Implementation Strategy */}
    <dbmC.ModelingLanguageBindingElement
      name="MNRelationshipStrategy"

      sourceModelElementRef={<etC.TypeObjectReference
        $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}

      decisionIssues={[
        <gdmC.DecisionModel $refByName="//www.aelastics.org/Persistence_GDM/ManyToManyImplement" />,
      ]}

      // Condition: Only for M:N relationships
      condition='return (r) => {
                return r.ordinaryMappings && r.ordinaryMappings.length == 2 && 
                       r.ordinaryMappings[0].upperBound === "M" && 
                       r.ordinaryMappings[1].upperBound === "M";
            }'
    />

    {/* Bind 0:1-0:M Relationships (One-to-Many) */}
    <dbmC.ModelingLanguageBindingElement
      name="OneNRelationshipStrategy"
      description="Strategy for One-to-Many relationships"

      sourceModelElementRef={<etC.TypeObjectReference
        $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}

      // We could add a new decision issue for this if we had one in GDM (e.g. FK location)
      // For now, reusing PK naming convention or similar if applicable, or just demonstrating selection.
      // Let's assume we want to decide PK strategy for the relation? No, that's for entities.
      // Let's just bind it to a placeholder or existing issue to show we caught it.
      decisionIssues={[
        // For example, ask about FK Naming
        <gdmC.DecisionModel $refByName="//www.aelastics.org/Persistence_GDM/ManyToManyImplement" />, // Reusing just for demo, usually would be "FK Strategy"
      ]}

      // Condition: 0:1 on one side, 0:M on other
      condition='return (r) => {
                if (!r.ordinaryMappings || r.ordinaryMappings.length !== 2) return false;
                const m1 = r.ordinaryMappings[0];
                const m2 = r.ordinaryMappings[1];
                return (m1.upperBound === "1" && m2.upperBound === "M") || 
                       (m1.upperBound === "M" && m2.upperBound === "1");
            }'
    />

  </dbmC.ModelingLanguageBindingModel>
)
