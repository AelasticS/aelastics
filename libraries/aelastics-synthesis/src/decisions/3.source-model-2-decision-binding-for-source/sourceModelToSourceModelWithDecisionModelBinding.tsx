/** @jsx hm */

import { hm } from "../../jsx/handle";
import { abstractM2M } from "../../transformations/abstractM2M";
import { Element, Resolve } from "../../jsx/element";
import { Context } from "../../jsx/context";
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../../index";
import { IModel, IModelElement, Model, ModelElement } from "generic-metamodel";
import * as gdmT from "../1.generic-decision-model/generic-decision-meta.model";
import * as gdmC from "../1.generic-decision-model/generic-decision-meta.model-components";

import * as dbmT from "../2.decision-binding-model/decision-binding-meta.model";
import * as dbmC from "../2.decision-binding-model/decision-binding-meta.model-components";


export class SourceModelToSourceModelWithDecisionModelBinding extends abstractM2M<IModel, dbmT.IDecisionBindingModel, { 'bindingModel': dbmT.IDecisionBindingModel }> {
    constructor(store: ModelStore, extra?: { 'bindingModel': dbmT.IDecisionBindingModel }) {
        super(store, extra);
    }

    template(s: IModel) {
        return (
            <dbmC.DecisionBindingModel
                name={s.name + " Decision Template Binding Model"}
                description={s.description}
            >
                {s.elements.map((r) => {
                    const bindingElements: dbmT.IDecisionBindingElement[] = this.getBindingElementBySourceModelElement(r as IModelElement);

                    const issues: gdmT.IIssue[] = bindingElements.flatMap((e) => {
                        return e.decisionIssues;
                    });

                    return (
                        <dbmC.DecisionBindingElement
                            name={`Decision for ${r.name}`}
                            description={`Decision for ${r.name}`}
                            decisionIssues={issues}
                            condition="return (e) => true"
                        // sourceModelElementRef={<ModelElement $refByName={`${r.path}/${r.name}`} />}
                        // TODO there is no component for ModelElement
                        />
                    );

                })}
            </dbmC.DecisionBindingModel>

        );
    }

    private getBindingElementBySourceModelElement(sourceModelElement: IModelElement): dbmT.IDecisionBindingElement[] {
        return this.extra?.bindingModel.elements.filter((e) => {
            const type = this.context.store.getTypeOf(sourceModelElement);
            const fn = (e as dbmT.IDecisionBindingElement).condition === undefined || new Function((e as dbmT.IDecisionBindingElement).condition!)();

            const res = (e as dbmT.IDecisionBindingElement).sourceModelElementRef.name === type.name
                && (typeof fn !== "function" || (typeof fn === "function" && fn(sourceModelElement)));

            return res;
        }) as dbmT.IDecisionBindingElement[] || [] as dbmT.IDecisionBindingElement[];
    }

}