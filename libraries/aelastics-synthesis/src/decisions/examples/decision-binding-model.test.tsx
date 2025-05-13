/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";

import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';

import * as gdmC from "../generic-decision-model/generic-decision-meta.model-components";
import * as gdmT from "../generic-decision-model/generic-decision-meta.model";

import * as etC from "../../types-metamodel/types-components"
import * as etT from "../../types-metamodel/types-meta.model";
import * as eerM from "../../types-metamodel/models/eer-metamodel-aelasticTypes";

import * as dbmT from "../decision-binding-model/decision-binding-meta.model";
import * as dbmC from "../decision-binding-model/decision-binding-meta.model-components";



const testStore = new ModelStore();
const context = new Context();

const bindingModel: Element<dbmT.IDecisionBindingModel> = (
    <dbmC.DecisionBindingModel
        name="Decision Binding Model"
        description="This is a decision binding model"
        store={testStore}
    >
        <dbmC.DecisionBindingElement
            name="Naming convention - gdm"
            description="This is a generic decision model for naming convention"

            sourceModelElementRef={<etC.TypeObjectReference $refByName="//www.aelastics.org/aelastic-EERModel/Relationship" />}

            decisionIssues={[
                <gdmC.GenericDecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm/PK Naming convention" />,
                <gdmC.GenericDecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm/FK Naming convention" />
            ]}
            condition="true"
        >
        </dbmC.DecisionBindingElement>
    </dbmC.DecisionBindingModel>
);

describe("Test Decision binding model", () => {
    it("Create binding models", () => {
        const eerModel: etT.ITypeModel = eerM.EERModel.render(context);
        const bindingModel1: dbmT.IDecisionBindingModel = bindingModel.render(context);

        // expect(eerModel).toBeDefined();
        expect(bindingModel1).toBeDefined();
    });
});

