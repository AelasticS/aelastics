/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import { ModelStore } from '../../index';

import * as mlbC from "../2.modeling-language-binding/modeling-language-binding-meta.model-components";
import * as etC from "../../types-metamodel/types-components";
import * as ddC from "../1.design-decision/design-decision-meta.model-components";

// We assume the DDM and Source Metamodel are loaded in the store
export const createBindingModel = (store: ModelStore) => (
    <mlbC.ModelingLanguageBindingModel
        name="Company_Persistence_Binding"
        description="Binding Company EER Model to Persistence Decisions"
    >
        <mlbC.ModelingLanguageBindingElement
            name="PKStrategyBinding"
            description="Binding Primary Key Strategy to EER Model"
            sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Kernel" />}  // Rename Kernel to Entity
            decisionIssues={[
                <ddC.DecisionModel $refByName="//www.aelastics.org/Persistence_DDM/PrimaryKeyStrategy" />,
                <ddC.DecisionModel $refByName="//www.aelastics.org/Persistence_DDM/NamingConvention" />,
            ]}
        />

        <mlbC.ModelingLanguageBindingElement
            name="OneToManyBinding"
            description="Binding 1:N Relationship Strategy to EER Model"
            sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}
            decisionIssues={[
                <ddC.DecisionModel $refByName="//www.aelastics.org/Persistence_DDM/OneToManyImplement" />
            ]}

            condition='return (e) => {
                if (!e.ordinaryMappings || e.ordinaryMappings.length !== 2) return false;
                const m1 = e.ordinaryMappings[0];
                const m2 = e.ordinaryMappings[1];
                return (m1.upperBound === "1" && m1.lowerBound === "0" && m2.upperBound === "M") || 
                       (m1.upperBound === "M" && m2.upperBound === "1" && m2.lowerBound === "0");
            }'
        />


    </mlbC.ModelingLanguageBindingModel>
);
