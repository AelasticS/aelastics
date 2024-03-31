/** @jsx hm */
/*
 * Copyright (c) AelasticS 2023.
 */

import * as t from "aelastics-types";
import { IModel } from "generic-metamodel";
import { hm } from "../jsx/handle";
import { Context } from "../jsx/context";
import {
  M2M_Transformation,
  E2E_Transformation,
  M2M_Trace,
  E2E_Trace,
} from "./transformation.model.components_v2";
import { IM2M_Transformation } from "./transformation.model.type";
import { CpxTemplate, Element, Super, Template } from "../jsx/element";
import { ModelStore } from "./../index";

type IODescr = { type?: t.Any; instance?: IModel };

class M2MContext extends Context {
  public input: IODescr = {};
  public output: IODescr = {};
  public readonly traceMap: Map<any, any> = new Map();

  constructor() {
    super();
  }

  public makeTrace(input: any, output: any) {
    this.traceMap.set(input, output);
  }

  public resolve(input: any): any {
    return this.traceMap.get(input);
  }
}

export interface IM2M<S extends IModel, D extends IModel> {
  context: M2MContext;
  m2mTRansformation?: IM2M_Transformation;
  template(props: S): Element<S, D>;
  transform(source: S): D;
}

export abstract class abstractM2M<S extends IModel, D extends IModel>
  implements IM2M<S, D>
{
  // transformation type
  public m2mTRansformation?: IM2M_Transformation;
  public context: M2MContext = new M2MContext();

  public constructor(store?: ModelStore) {
    if (store) this.context.pushStore(store);
  }

  abstract template(props: S): Element<S, D>;

  // TODO: add arguments: globalConfig and localConfig
  public transform(source: S): D {
    return this.template(source).render(this.context);
  }
}
