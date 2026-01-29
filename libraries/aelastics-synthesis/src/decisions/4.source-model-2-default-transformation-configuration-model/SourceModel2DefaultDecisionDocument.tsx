/** @jsx hm */

import { hm } from "../../jsx/handle";
import { abstractM2M } from "../../transformations/abstractM2M";
import { Element } from "../../jsx/element";
import { E2E, ModelStore, M2M } from "../../index";
import { IModel, IModelElement, Model, ModelElement } from "generic-metamodel";

import * as gdmT from "../1.design-decision/design-decision-meta.model";
import * as dbmT from "../2.modeling-language-binding/modeling-language-binding-meta.model";

import * as dmT from "../3.transformation-configuration/transformation-configuration-meta.model";
import * as dmC from "../3.transformation-configuration/transformation-configuration-meta.mode-components";

@M2M({
    input: Model,
    output: dmT.TransformationConfigurationModel,
})
export class SourceModelToDefaultTransformationConfigurationModel extends abstractM2M<IModel, dmT.ITransformationConfigurationModel, { 'bindingModel': dbmT.IModelingLanguageBindingModel }> {
    constructor(store: ModelStore, extra: { 'bindingModel': dbmT.IModelingLanguageBindingModel }) {
        super(store, extra);
    }

    template(s: IModel) {
        return (
            <dmC.TransformationConfigurationModel
                name={s.name + " Default Transformation Configuration Model"}
                description={s.description}
                relatedModel={s as IModel}
            >
                {s.elements.map((r) => {
                    return this.createDecisionForSourceModelElement(r as IModelElement);
                })}
            </dmC.TransformationConfigurationModel>

        );
    }

    @E2E({
        input: ModelElement,
        output: dmT.DecisionForElement,
        ruleName: "SourceModelElement2DecisionModelForElement",
    })
    private createDecisionForSourceModelElement(sourceModelElement: IModelElement): Element<dmT.IDecisionForElement> {
        const type = this.context.store.getTypeOf(sourceModelElement);
        // this shuld be one binding element for each source model element, but eventually it can be more than one, so we need to handle thats
        const decisionBindingElements = this.getBindingElementBySourceModelElement(sourceModelElement);

        return (
            <dmC.DecisionForElement
                name={`Decision for ${sourceModelElement.name} of type ${type.name}`}
                description={`Decision for ${sourceModelElement.name} of type ${type.name}`}
                elementId={sourceModelElement.id}
            >
                {decisionBindingElements.flatMap((e) => {
                    return e.decisionIssues.map((issue) => {
                        return this.createChosenOptionForIssue(issue, sourceModelElement);
                    })
                })}

            </dmC.DecisionForElement>
        );
    }

    @E2E({
        input: gdmT.Issue,
        output: dmT.BaseSelectedOption, // Use the concrete base type
        ruleName: "Issue2SelectedOption",
    })
    private createChosenOptionForIssue(issue: gdmT.IIssue, sourceModelElement: IModelElement): Element<dmT.IBaseSelectedOption> {

        let defaultOption: gdmT.IOption | undefined = issue.possibleOptions.find((o: gdmT.IOption) => {
            return o.isDefault === true;
        });

        if (!defaultOption) {
            defaultOption = issue.possibleOptions[0];
        }

        // Ensure defaultOption is defined and of correct type
        if (!defaultOption) {
            throw new Error("No possible options available for issue: " + issue.label);
        }

        // Create the specific component for this option
        // const SelectedOptionForThisOption = dmC.SelectedOption(defaultOption);

        const isSimpleOption: boolean = this.context.store.isTypeOf(defaultOption.optionType, gdmT.SimpleOption);

        return (
            <dmC.SelectedOption
                name={`Selected option for ${sourceModelElement.name} is ${defaultOption.name}`}
                description={`Selected option for ${sourceModelElement.name} is ${defaultOption.name}`}
                assumptions="Default assumptions"
                justification="Default justification"
                consequences="Default consequences"
                ref={defaultOption as gdmT.IOption}
                value={isSimpleOption ? (
                    <dmC.SimpleOption name={`Simple option for ${defaultOption.name} for ${sourceModelElement.name}`}
                        defaultValue={"defaultString"}
                    />
                ) : (
                    // Debugging CompositeOption
                    (() => {
                        const optType = defaultOption.optionType as gdmT.ICompositeOption;
                        if (!optType.subIssues) {
                            console.log("Error: subIssues is undefined for option:", defaultOption.name);
                            console.log("OptionType object:", JSON.stringify(optType, null, 2));
                        }
                        return (
                            <dmC.CompositeOption name={`Composite option for ${defaultOption.name} for ${sourceModelElement.name}`}>
                                {(defaultOption.optionType as gdmT.ICompositeOption).subIssues?.map((subIssue: gdmT.IIssue) => {
                                    return this.createChosenOptionForIssue(subIssue, sourceModelElement);
                                })}
                            </dmC.CompositeOption>
                        );
                    })()
                )}>
            </dmC.SelectedOption>
        );
    }

    private getBindingElementBySourceModelElement(sourceModelElement: IModelElement): dbmT.IModelingLanguageBindingElement[] {
        return this.extra?.bindingModel.bindings.filter((e) => {
            const type = this.context.store.getTypeOf(sourceModelElement);
            const fn = (e as dbmT.IModelingLanguageBindingElement).condition === undefined || new Function((e as dbmT.IModelingLanguageBindingElement).condition!)();

            const res = (e as dbmT.IModelingLanguageBindingElement).sourceModelElementRef.name === type.name
                && (typeof fn !== "function" || (typeof fn === "function" && fn(sourceModelElement)));

            return res;
        }) as dbmT.IModelingLanguageBindingElement[] || [] as dbmT.IModelingLanguageBindingElement[];
    }

}