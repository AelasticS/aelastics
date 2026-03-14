/** @jsx hm */

import { hm } from "../../jsx/handle"
import { abstractM2M } from "../../transformations/abstractM2M"
import { Element, Resolve } from "../../jsx/element"
import { Context } from "../../jsx/context"
import { E2E, ModelStore, M2M, SpecPoint, SpecOption } from "../../index"
import { IModel, IModelElement, Model, ModelElement } from "generic-metamodel"
import * as gdmT from "../1.decision-model/decision-meta.model"
import * as gdmC from "../1.decision-model/decision-meta.model-components"

import * as dbmT from "../2.binding-model/binding-meta.model"
import * as dbmC from "../2.binding-model/binding-meta.model-components"


export class SourceModelToSourceModelWithDecisionModelBinding extends abstractM2M<IModel, dbmT.IBindingModel, {
  "bindingModel": dbmT.IBindingModel
}> {
  constructor(store: ModelStore, extra?: { "bindingModel": dbmT.IBindingModel }) {
    super(store, extra)
  }

  template(s: IModel) {
    return (
      <dbmC.BindingModel
        name={s.name + " Decision Template Binding Model"}
        description={s.description}
      >
        {s.elements.map((r) => {
          const bindingElements: dbmT.IBindingElement[] = this.getBindingElementBySourceModelElement(r as IModelElement)

          const issues: gdmT.IIssue[] = bindingElements.flatMap((e) => {
            return e.issues
          })

          return (
            <dbmC.BindingElement
              name={`Decision for ${r.name}`}
              description={`Decision for ${r.name}`}
              issues={issues}
              condition="return (e) => true"
              // sourceModelElementRef={<ModelElement $refByName={`${r.path}/${r.name}`} />}
              // TODO there is no component for ModelElement
            />
          )

        })}
      </dbmC.BindingModel>

    )
  }

  private getBindingElementBySourceModelElement(sourceModelElement: IModelElement): dbmT.IBindingElement[] {
    return this.extra?.bindingModel.elements.filter((e) => {
      const type = this.context.store.getTypeOf(sourceModelElement)
      const fn = (e as dbmT.IBindingElement).condition === undefined || new Function((e as dbmT.IBindingElement).condition!)()

      const res = (e as dbmT.IBindingElement).element.name === type.name
        && (typeof fn !== "function" || (typeof fn === "function" && fn(sourceModelElement)))

      return res
    }) as dbmT.IBindingElement[] || [] as dbmT.IBindingElement[]
  }

}