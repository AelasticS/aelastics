/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";

import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';

import * as gdmC from "../1.decision-model/decision-meta.model-components";
import * as gdmT from "../1.decision-model/decision-meta.model";
import * as gdmM from "./generic-decision-model-example"

import * as etC from "../../types-metamodel/types-components"
import * as etT from "../../types-metamodel/types-meta.model";
import * as eerM from "../../types-metamodel/models/eer-metamodel-aelasticTypes";

import * as dbmT from "../2.binding-model/binding-meta.model";
import * as dbmC from "../2.binding-model/binding-meta.model-components";

const context = new Context();
// const store = new ModelStore();

export const bindingModel = (store: ModelStore) => (
    <dbmC.BindingModel
        name="Decision Binding Model"
        description="This is a decision binding model"
        sourceModel={<etC.TypeModel $refByName="//www.aelastics.org/aelastic-EERModel" />}
        decisionModel={<dbmC.BindingModel $refByName="//www.aelastics.org/Namingconvention-gdm" />}
        store={store}
    >
        <dbmC.BindingElement
            name="Strategy for 01.0M relationships"
            description="This is a Strategy for 01:0M relationships"

            element={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}

            issues={[
                <gdmC.DecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm/ForeignkeyorSeparateTable" />,
            ]}
            condition='return (r) => {return (r.ordinaryMappings[0].lowerBound === "0" && r.ordinaryMappings[0].upperBound === "1" && r.ordinaryMappings[1].upperBound === "M") ||
    (r.ordinaryMappings[1].lowerBound === "0" && r.ordinaryMappings[1].upperBound === "1" && r.ordinaryMappings[0].upperBound === "M");}'
        />

        <dbmC.BindingElement
            name="FK Naming conventions for relationships"
            description="This is a generic decision model for naming convention"

            element={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}

            issues={[
                <gdmC.DecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm/PKNamingconvention" />,
                <gdmC.DecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm/FKNamingconvention" />
            ]}
        // TODO: if condition is empty, it means true
        />

    </dbmC.BindingModel>
);


// describe("Test Decision binding model", () => {
//     it("Create binding models", () => {
//         // set same store for all models, no metter if they are imported or created in the same file
//         (eerM.EERModel.props as any).store = store;
//         (gdmM.NamingConventionGDM.props as any).store = store;

//         const eerModel: etT.ITypeModel = eerM.EERModel.render(context);
//         const namingConventionGDM: gdmT.IGenericDecisionModel = gdmM.NamingConventionGDM.render(context);

//         const bindingModel1: dbmT.IDecisionBindingModel = bindingModel.render(context);

//         // expect(eerModel).toBeDefined();
//         expect(bindingModel1).toBeDefined();
//     });
// });

