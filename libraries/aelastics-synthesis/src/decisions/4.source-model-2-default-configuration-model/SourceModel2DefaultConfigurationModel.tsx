/** @jsx hm */

import { hm } from "../../jsx/handle"
import { abstractM2M } from "../../transformations/abstractM2M"
import { Element } from "../../jsx/element"
import { E2E, ModelStore, M2M } from "../../index"
import { IModel, IModelElement, Model, ModelElement } from "generic-metamodel"

import * as dmT from "../1.decision-model/decision-meta.model"
import * as bmT from "../2.binding-model/binding-meta.model"

import * as cmT from "../3.configuration-model/configuration-meta.model"
import * as cmC from "../3.configuration-model/configuration-meta.model-components"
import { Choice } from "../3.configuration-model/configuration-meta.model-components"

@M2M({
  input: Model,
  output: cmT.ConfigurationModel,
})
export class SourceModelToDefaultConfigurationModel extends abstractM2M<IModel, cmT.IConfigurationModel, {
  "bindingModel": bmT.IBindingModel
}> {
  constructor(store: ModelStore, extra: { "bindingModel": bmT.IBindingModel }) {
    super(store, extra)
  }

  template(s: IModel) {
    return (
      <cmC.ConfigurationModel
        name={s.name + " Default Configuration Model"}
        description={s.description}
        sourceModel={s as IModel}
        bindingModel={this.extra?.bindingModel as bmT.IBindingModel}
      >

        {this.extra?.bindingModel.decisionModel.issues.filter((issue: dmT.IIssue) => {
          return this.context.store.isTypeOf(issue, dmT.ModelIssue)
        })
          .map((issue) => {
            return this.createGlobalChoice(issue)
          })}

        {s.elements.map((r) => {
          return this.createElementChoices(r as IModelElement)
        })}
      </cmC.ConfigurationModel>

    )
  }

  @E2E({
    input: ModelElement,
    output: cmT.ElementDecision,
    ruleName: "SourceModelElement2DecisionModelForElement",
  })
  private createElementChoices(sourceModelElement: IModelElement): Element<cmT.IDecision> | null {

    const decisionBindingElements = this.getBindingElementBySourceModelElement(sourceModelElement)
    // this shuld be one binding element for each source model element, but eventually it can be more than one, so we need to handle thats
    const choices = decisionBindingElements.flatMap((e) => {
      return e.issues.map((issue) => {
        return this.createChosenOptionForIssue(issue) as unknown as cmT.IChoice
      })
    })

    if (choices.length === 0) {
      return null
    }

    const type = this.context.store.getTypeOf(sourceModelElement)

    return (
      <cmC.ElementChoice
        name={`ec_${sourceModelElement.name}`}
        description={`Decision for ${sourceModelElement.name} of type ${type.name}`}
        element={sourceModelElement}
        choices={choices}
      >


      </cmC.ElementChoice>
    )
  }

  @E2E({
    input: dmT.Issue,
    output: cmT.BaseChoice, // Use the concrete base type
    ruleName: "Issue2SelectedOption",
  })
  private createChosenOptionForIssue(issue: dmT.IIssue): Element<cmT.IChoice> {

    let defaultOption: dmT.IOption | undefined = issue.possibleOptions.find((o: dmT.IOption) => {
      return o.isDefault === true
    })

    if (!defaultOption) {
      defaultOption = issue.possibleOptions[0]
    }

    // Ensure defaultOption is defined and of correct type
    if (!defaultOption) {
      throw new Error("No possible options available for issue: " + issue.label)
    }

    // Create the specific component for this option
    // const SelectedOptionForThisOption = dmC.SelectedOption(defaultOption);

    return (
      <cmC.Choice
        name={`c_${defaultOption.name}` + Math.random().toString(16).slice(2)}
        description={`Selected option is ${defaultOption.name}`}
        selectedOption={defaultOption as dmT.IOption}
        issue={(defaultOption as dmT.IOption).ParentIssue}
      >
      </cmC.Choice>
    )
  }

  private getBindingElementBySourceModelElement(sourceModelElement: IModelElement): bmT.IBindingElement[] {
    return this.extra?.bindingModel.bindings.filter((e) => {
      const type = this.context.store.getTypeOf(sourceModelElement)
      const fn = (e as bmT.IBindingElement).condition === undefined || new Function((e as bmT.IBindingElement).condition!)()

      const type2 = this.context.store.getAElasticsType(sourceModelElement);
      const a = this.context.store.isTypeOf(sourceModelElement, type);

      const res = (e as bmT.IBindingElement).element.name === type.name
        && (typeof fn !== "function" || (typeof fn === "function" && fn(sourceModelElement)))

      return res
    }) as bmT.IBindingElement[] || [] as bmT.IBindingElement[]
  }

  private createGlobalChoice(issue: dmT.IModelIssue) {
    return <cmC.GlobalChoice name={`gc_${issue.name}`}
                             choices={[this.createChosenOptionForIssue(issue) as unknown as cmT.IChoice]}

    />
  }
}