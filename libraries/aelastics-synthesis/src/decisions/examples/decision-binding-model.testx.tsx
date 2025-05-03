
/** @jsx hm */


import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import * as dbmT from "../decision-binding-model/decision-binding-meta.model";
import { DecisionBindingModel, DecisionBindingElement } from "../decision-binding-model/decision-binding-meta.model-components";

import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';

import { GenericDecisionModel } from "../generic-decision-model/generic-decision-meta.model-components";

import { Model, ModelElement } from "generic-metamodel";
import * as eerT from "../../test/eer-model/EER.meta.model.type";
import { EERSchema, Relationship } from "../../test/eer-model/EER-components";


const testStore = new ModelStore();
const context = new Context();

const bindingModel: Element<dbmT.IDecisionBindingModel> = (
    <DecisionBindingModel
        name="Decision Binding Model"
        description="This is a decision binding model"
        store={testStore}
    >
        <DecisionBindingElement
            name="Naming convention - gdm"
            description="This is a generic decision model for naming convention"

            // todo this is not correct, it should be a reference to the type, not the instance
            sourceModelElementRef={<Relationship $refByName="//www.aelastics.org/Persons/worksIn" />}

            // sourceModelElementRef={<Object $refByName="//www.aelastics.org/EER/Relationship" />}

            genericDecisionModel={<GenericDecisionModel $refByName="//www.aelastics.org/Namingconvention-gdm" />}
            condition="true"
        >
        </DecisionBindingElement>
    </DecisionBindingModel>
);