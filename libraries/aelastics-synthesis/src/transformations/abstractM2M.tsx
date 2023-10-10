/** @jsx hm */
/*
 * Copyright (c) AelasticS 2023.
 */

import * as t from "aelastics-types";
import { IModel, IModelElement } from "generic-metamodel";
import { hm } from "../jsx/handle";
import { Context } from "../jsx/context";
import {
  M2M_Transformation,
  E2E_Transformation,
  M2M_Trace,
  E2E_Trace,
} from "./transformation.model.components_v2";
import * as tm from "./transformation.model.type";
import { CpxTemplate, Element, Super, Template } from "../jsx/element";
import { ModelStore } from "./../index";
import { Model } from "generic-metamodel/src/models.type";

type IODescr = { type?: t.Any; instance?: IModel };
type TransformationDescr = {
  type?: tm.IM2M_Transformation;
  instance?: tm.IM2M_Trace;
};

export class M2MContext extends Context {
  public input: IODescr = {};
  public output: IODescr = {};
  public transformation: TransformationDescr = {};

  public readonly traceMap: Map<
    IModelElement,
    Element<IModelElement> | undefined
  > = new Map();

  public readonly resolveMap: Map<
    Element<IModelElement>,
    IModelElement | undefined
  > = new Map();

  constructor() {
    super();
  }

  public makeTrace(
    sourceModelElement: IModelElement,
    targetJSXElement: Element<IModelElement> | undefined // can be undefined, when it only need to be logged method call, not and result
  ) {
    this.traceMap.set(sourceModelElement, targetJSXElement);

    // TODO update this map during render of element
    if (targetJSXElement) {
      this.resolveMap.set(targetJSXElement, undefined);
    }
  }

  /**
   *
   * @param input
   * @returns
   *
   * @deprecated Use resolveRender function
   */
  public resolve(input: any): any {
    return this.traceMap.get(input);
  }
}

export interface IM2M<S extends IModel, D extends IModel> {
  context: M2MContext;
  m2mTRansformation?: tm.IM2M_Transformation;
  template(props: S): Element<S, D>;
  transform(source: S): D;
}

export abstract class abstractM2M<S extends IModel, D extends IModel>
  implements IM2M<S, D>
{
  // transformation type
  public m2mTRansformation?: tm.IM2M_Transformation;
  public context: M2MContext = new M2MContext();

  public constructor(store?: ModelStore) {
    if (store) this.context.pushStore(store);
  }

  abstract template(props: S): Element<S, D>;

  // TODO: add arguments: globalConfig and localConfig
  public transform(source: S): D {
    const targetModel = this.template(source).render<D>(this.context);

    this.context.input.instance = source;
    this.context.output.instance = targetModel;

    this.createTraceModel();

    return targetModel;
  }

  private createTraceModel() {
    const { store } = this.context;

    // create instance of TraceModel
    this.context.transformation.instance = store.newModel<tm.IM2M_Trace>(
      tm.M2M_Trace,
      {
        name: `${this.context.input.instance?.name} to ${this.context.output.instance?.name}`,
        from: this.context.input.instance?.name!,
        to: this.context.output.instance?.name!,
      }
    );

    this.context.transformation.instance.instanceOf =
      this.context.transformation.type!;

    // create instances of E2E trace
    Array.from(this.context.traceMap.entries()).forEach(([k, v]) => {
      if (v) {
        const targetModelElement = this.context.resolveMap.get(v);

        const ruleType = this.context.transformation.type?.elements.find(
          (e) => e.name == v.rule
        ) as tm.IE2E_Transformation;

        if (targetModelElement) {
          store.newModelElement<tm.IE2E_Trace>(
            this.context.transformation.instance!,
            this.context.transformation.instance!,
            tm.E2E_Trace,
            {
              name: `${k.name} to ${targetModelElement?.name}`,
              parentModel: this.context.transformation.instance,
              from: [k.name],
              to: [targetModelElement.name],
              instanceOf: ruleType,
            }
          );
        }
      }
    });

    // return (
    //   <M2M_Trace
    //     name={`${this.context.input.instance?.name} to ${this.context.output.instance?.name}`}
    //   >
    //     {Array.from(this.context.traceMap.entries()).map(([k, v]) => {
    //       if (v) {
    //         const targetModelElement = this.context.resolveMap.get(v);
    //         return targetModelElement ? (
    //           <E2E_Transformation>
    //             <E2E_Trace
    //               from={[{ id: k.id }]}
    //               to={[{ id: targetModelElement.id }]}
    //             ></E2E_Trace>
    //           </E2E_Transformation>
    //         ) : null;
    //       }
    //     })}
    //   </M2M_Trace>
    // );
  }
}
