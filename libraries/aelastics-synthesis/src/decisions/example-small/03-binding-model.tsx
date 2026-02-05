/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import { ModelStore } from '../../index';

import * as mlbC from "../2.modeling-language-binding/modeling-language-binding-meta.model-components";
import * as etC from "../../types-metamodel/types-components";
import * as ddC from "../1.design-decision/design-decision-meta.model-components";


export const ER_Bindungs = (store: ModelStore) => (
    <mlbC.ModelingLanguageBindingModel
        name="ER_Bindungs"
        description="Binding EER Model concepts to relation schema design issues"
    >
        <mlbC.ModelingLanguageBindingElement
            name="PKStrategyBinding"
            description="Binding Primary Key Strategy to EER Model"
            sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Entity" />}  
            decisionIssues={[
                <ddC.DecisionModel $refByName="//www.aelastics.org/RelationSchemaDesignIssues/PrimaryKeyStrategy" />,
                <ddC.DecisionModel $refByName="//www.aelastics.org/RelationSchemaDesignIssues/NamingConvention" />,
            ]}
        />

        <mlbC.ModelingLanguageBindingElement
            name="OneToManyBinding"
            description="Binding 1:N Relationship Strategy to EER Model"
            sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}
            decisionIssues={[
                <ddC.DecisionModel $refByName="//www.aelastics.org/RelationSchemaDesignIssues/OneToManyImplement" />
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
