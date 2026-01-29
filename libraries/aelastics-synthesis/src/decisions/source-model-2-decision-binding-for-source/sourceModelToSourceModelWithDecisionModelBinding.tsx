/** @jsx hm */

import { hm } from "../../jsx/handle"
import { abstractM2M } from "../../transformations/abstractM2M"
import { Element, Resolve } from "../../jsx/element"
import { Context } from "../../jsx/context"
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../../index"
import { IModel, IModelElement, Model, ModelElement } from "generic-metamodel"
import * as gdmT from "../1.design-decision/design-decision-meta.model"
import * as gdmC from "../1.design-decision/design-decision-meta.model-components"

import * as dbmT from "../2.modeling-language-binding/modeling-language-binding-meta.model"
import * as dbmC from "../2.modeling-language-binding/modeling-language-binding-meta.model-components"


export class SourceModelToSourceModelWithDecisionModelBinding extends abstractM2M<IModel, dbmT.IModelingLanguageBindingModel, {
  "bindingModel": dbmT.IModelingLanguageBindingModel
}> {
  constructor(store: ModelStore, extra?: { "bindingModel": dbmT.IModelingLanguageBindingModel }) {
    super(store, extra)
  }

  template(s: IModel) {
    return (
      <dbmC.ModelingLanguageBindingModel
        name={s.name + " Decision Template Binding Model"}
        description={s.description}
      >
        {s.elements.map((r) => {
          const bindingElements: dbmT.IModelingLanguageBindingElement[] = this.getBindingElementBySourceModelElement(r as IModelElement)

          const issues: gdmT.IIssue[] = bindingElements.flatMap((e) => {
            return e.decisionIssues
          })

          return (
            <dbmC.ModelingLanguageBindingElement
              name={`Decision for ${r.name}`}
              description={`Decision for ${r.name}`}
              decisionIssues={issues}
              condition="return (e) => true"
              // sourceModelElementRef={<ModelElement $refByName={`${r.path}/${r.name}`} />}
              // TODO there is no component for ModelElement
            />
          )

        })}
      </dbmC.ModelingLanguageBindingModel>

    )
  }

  private getBindingElementBySourceModelElement(sourceModelElement: IModelElement): dbmT.IModelingLanguageBindingElement[] {
    return this.extra?.bindingModel.elements.filter((e) => {
      const type = this.context.store.getTypeOf(sourceModelElement)
      const fn = (e as dbmT.IModelingLanguageBindingElement).condition === undefined || new Function((e as dbmT.IModelingLanguageBindingElement).condition!)()

      const res = (e as dbmT.IModelingLanguageBindingElement).sourceModelElementRef.name === type.name
        && (typeof fn !== "function" || (typeof fn === "function" && fn(sourceModelElement)))

      return res
    }) as dbmT.IModelingLanguageBindingElement[] || [] as dbmT.IModelingLanguageBindingElement[]
  }

}