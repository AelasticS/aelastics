/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";

import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';

import * as gdmC from "../1.generic-decision-model/generic-decision-meta.model-components";
import * as gdmT from "../1.generic-decision-model/generic-decision-meta.model";
import * as gdmM from "./generic-decision-model"

import * as etC from "../../types-metamodel/types-components"
import * as etT from "../../types-metamodel/types-meta.model";
import * as eerM from "../../types-metamodel/models/eer-metamodel-aelasticTypes";

import * as dbmT from "../2.decision-binding-model/decision-binding-meta.model";
import * as dbmC from "../2.decision-binding-model/decision-binding-meta.model-components";

const context = new Context();
const store = new ModelStore();

const bindingModel: Element<dbmT.IDecisionBindingModel> = (
    <dbmC.DecisionBindingModel
        name="Decision Binding Model"
        description="This is a decision binding model"
        store={store}
    >
        <dbmC.DecisionBindingElement
            name="Naming convention - gdm"
            description="This is a generic decision model for naming convention"

            sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}

            decisionIssues={[
                <gdmC.GenericDecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm/PKNamingconvention" />,
                <gdmC.GenericDecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm/FKNamingconvention" />
            ]}
            condition="true"
        >
        </dbmC.DecisionBindingElement>
    </dbmC.DecisionBindingModel>
);

describe("Test Decision binding model", () => {
    it("Create binding models", () => {
        // set same store for all models, no metter if they are imported or created in the same file
        (eerM.EERModel.props as any).store = store;
        (gdmM.NamingConventionGDM.props as any).store = store;

        const eerModel: etT.ITypeModel = eerM.EERModel.render(context);
        const namingConventionGDM: gdmT.IGenericDecisionModel = gdmM.NamingConventionGDM.render(context);

        const bindingModel1: dbmT.IDecisionBindingModel = bindingModel.render(context);

        // expect(eerModel).toBeDefined();
        expect(bindingModel1).toBeDefined();
    });
});

