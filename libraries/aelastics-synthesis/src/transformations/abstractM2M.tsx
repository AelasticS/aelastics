/** @jsx createExprNode */
/*
 * Copyright (c) AelasticS 2023.
 */

import * as t from "aelastics-types";
import { IModel, IModelElement } from "generic-metamodel";
import { createExprNode } from "../jsx/handle";
import { Context } from "../jsx/context";
import {
  M2M_Transformation,
  E2E_Transformation,
  M2M_Trace,
  E2E_Trace,
} from "./transformation.model.components_v2";
import * as tm from "./transformation.model.type";
import { CpxTemplate, ExprNode, Super, Template } from "../jsx/element";
import { ModelStore } from "./../index";
import { Model } from "generic-metamodel/src/models.type";
import { IConfigurationModel, IChoice } from "./../decisions/3.configuration-model/configuration-meta.model";


type IODescr = { type?: t.Any; instance?: IModel };
type TransformationDescr = {
  type?: tm.IM2M_Transformation;
  instance?: tm.IM2M_Trace;
};

export interface ITraceRecord {
  target: ExprNode<IModelElement> | undefined;
  ruleName: string;
}

export const _privatePop = Symbol('privatePop');
export const _privatePush = Symbol('privatePush');

export class Stack<T> {
  private stack: Array<T> = [];

  private [_privatePop]: () => T | undefined = () => {
    return this.stack.pop();
  };

  private [_privatePush]: (element: T) => void = (element: T) => {
    this.stack.push(element);
  };

  public peek(): T | undefined {
    return this.stack[this.stack.length - 1];
  }

  public isEmpty(): boolean {
    return this.stack.length === 0;
  }
}

export class M2MContext<P = undefined> extends Context {
  
  public input: IODescr = {}
  public output: IODescr = {}
  public transformation: TransformationDescr = {}
  public currentElementDecision: Stack<IChoice[]> = new Stack<IChoice[]>()

  public readonly traceMap: Map<IModelElement, Array<ITraceRecord>> = new Map();

  public readonly resolveMap: Map<ExprNode<IModelElement>, IModelElement | undefined> = new Map();

  // param is used to keep additional information during transformation
  // passed from transform() method of abstractM2M
  public param?:P

  constructor() {
    super();
  }

  public makeTrace(
    sourceModelElement: IModelElement,
    targetJSXElement: ITraceRecord // can be undefined, when it only need to be logged method call, not and result
  ) {

    if (!this.traceMap.has(sourceModelElement)) {
      this.traceMap.set(sourceModelElement, [targetJSXElement]);
    } else {
      const tmpArray = this.traceMap.get(sourceModelElement) as Array<ITraceRecord>;
      tmpArray.push(targetJSXElement);
      this.traceMap.set(sourceModelElement, tmpArray);
    }

    // this map will be updated during rendering of element
    if (targetJSXElement.target) {
      this.resolveMap.set(targetJSXElement.target, undefined);
    }
  }

  /**
   * 
   * @param input IModelElement
   * @param ruleName string
   * @returns Element<IModelElement>
   */
  public resolveJSXElement(input: IModelElement, ruleName?: string): ExprNode<IModelElement> {
    // return this.traceMap.get(input);

    const traceRecords = this.traceMap.get(input);

    let targetJSXElement = undefined;

    if (traceRecords) {
      if (ruleName) {
        targetJSXElement = traceRecords.find(e => e.ruleName == ruleName)?.target
      } else {
        targetJSXElement = traceRecords[0].target;
      }
    }

    // TODO Should this be an Error or Null? The target JSXElement does not exist because of an error during the transformation or because the transformation rule is N/A
    if (!targetJSXElement) {
      throw new Error(
        `Target JSXElement for ${input} source model element does not exists!`
      );
    }

    return targetJSXElement;

  }
}

export interface IM2M<S extends IModel, D extends IModel, EM extends { [key: string]: IModel } = {}, DM extends IConfigurationModel = never, P = undefined> {
  context: M2MContext<P>;
  m2mTransformation?: tm.IM2M_Transformation;
  template(props: S): ExprNode<S, D>;
  transform(source: S): D;
}

// TODO: this class and intereface should be extended with optional Decision Model. 

// TODO DM extends Record<string, IModel> = Record<never, never>
// TODO Map<string, IModel> = Map<never, never>
export abstract class abstractM2M<S extends IModel, D extends IModel, EM extends { [key: string]: IModel } = {}, CM extends IConfigurationModel = never, P = undefined>
  implements IM2M<S, D, EM, never, P> {
  // transformation type
  public m2mTransformation?: tm.IM2M_Transformation;
  public context: M2MContext<P> = new M2MContext<P>();
  public extra?: EM;
  public configModel?: CM;

  public constructor(store?: ModelStore, extra?: EM, decisionModel?: CM) {
    if (store) this.context.pushStore(store);
    this.extra = extra;
    this.configModel = decisionModel;
  }

  abstract template(props: S): ExprNode<S, D>;

  public transform(source: S, param?: P): D {
    this.context.param = param;
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

        v.forEach(jsxElement => {

          const targetModelElement = this.context.resolveMap.get(jsxElement.target as ExprNode<IModelElement>);

          const ruleType = this.context.transformation.type?.elements.find(
            (e) => e.name == jsxElement.ruleName
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

        });
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
