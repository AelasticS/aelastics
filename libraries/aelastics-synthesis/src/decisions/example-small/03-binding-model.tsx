/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import { ModelStore } from '../../index';

import * as dbmC from "../2.modeling-language-binding/modeling-language-binding-meta.model-components";
import * as etC from "../../types-metamodel/types-components";
import * as gdmC from "../1.design-decision/design-decision-meta.model-components";

// We assume the GDM and Source Metamodel are loaded in the store
export const createBindingModel = (store: ModelStore) => (
    <dbmC.ModelingLanguageBindingModel
        name="Company_Persistence_Binding"
        description="Binding Company EER Model to Persistence Decisions"
    >
        <dbmC.ModelingLanguageBindingElement
            name="PKStrategyBinding"
            description="Binding Primary Key Strategy to EER Model"
            sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Kernel" />}  // Rename Kernel to Entity
            decisionIssues={[<gdmC.DecisionModel $refByName="//www.aelastics.org/Persistence_GDM/PrimaryKeyStrategy" />]}
        />


    </dbmC.ModelingLanguageBindingModel>
);
