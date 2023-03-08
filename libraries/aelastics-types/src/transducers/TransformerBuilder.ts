/*
 * Author: Sinisa Neskovic
 * 
 * Copyright (c) 2023 Aelastics
 */

import { Any } from "../common/DefinitionAPI";
import { Node } from "../common/Node";
import { TypeCategory } from "../type/TypeDefinisions";
import { ITransformer, WhatToDo } from "./Transformer";

export class TransformerBuilder {
  private initFs: Array<ITransformer["init"]> = [];
  private stepFs: Array<ITransformer["step"]> = [];
  private resultFs: Array<ITransformer["result"]> = [];

  public onInit(f: ITransformer["init"] | Array<ITransformer["init"]>) {
    Array.isArray(f) ? this.initFs.push(...f) : this.initFs.push(f);
    return this;
  }

  public onStep(f: ITransformer["step"] | Array<ITransformer["step"]>) {
    Array.isArray(f) ? this.stepFs.push(...f) : this.stepFs.push(f);
    return this;
  }
  public onResult(f: ITransformer["result"] | Array<ITransformer["result"]>) {
    Array.isArray(f) ? this.resultFs.push(...f) : this.resultFs.push(f);
    return this;
  }

  private runInits: ITransformer["init"] = (value, currNode) => {
    let what: WhatToDo = "continue";
    for (let i = 0; i < this.initFs.length && what === "continue"; i++) {
      [value, what] = this.initFs[i](value, currNode);
    }
    return [value, what];
  };

  private runSteps: ITransformer["step"] = (result, item, currNode) => {
    let what: WhatToDo = "continue";
    for (let i = 0; i < this.stepFs.length && what === "continue"; i++) {
      [result, what] = this.stepFs[i](result, item, currNode);
    }
    return [result, what];
  };

  private runResults: ITransformer["result"] = (result, currNode) => {
    let what: WhatToDo = "continue";
    for (let i = 0; i < this.resultFs.length && what === "continue"; i++) {
      [result, what] = this.resultFs[i](result, currNode);
    }
    return [result, what];
  };

  public build(): ITransformer {
    return {
      init: this.runInits,
      step: this.runSteps,
      result: this.runResults,
    };
  }
}

type FunctionType<T extends any[]> = (args: T) => [any, WhatToDo];

abstract class FunctionBuilder<F extends (...args: any) => [any, WhatToDo]> {
  private arrayOfFun: Array<F> = [];
  //private initFs: Array<FunctionType<Parameters<F>, ReturnType<F>>> = [];
  private getValue: (args: any[]) => any;
  private getCurrentNode: (args: any[]) => Node;

  constructor(
    getCurrentNode: (args: any[]) => Node = (args) => args[1],
    getValue: (args: any[]) => any = (args) => args[0]
  ) {
    this.getValue = getValue;
    this.getCurrentNode = getCurrentNode;
  }

  public onPredicate(predicate: <I extends Parameters<F>>(a: I) => Boolean, fun: F): this {
    let resF = <F>((args: Parameters<F>): [any, WhatToDo] => {
      if (predicate(args)) return fun(args);
      else return [this.getValue(args), "continue"];
    });
    this.arrayOfFun.push(resF);
    return this;
  }

  public onType(type: Any, f: F): this {
    let predicate: <I extends Parameters<F>>(a: I) => Boolean = (a) => {
      return this.getCurrentNode(a).type === type;
    };
    this.onPredicate(predicate, f);
    return this;
  }

  public onTypeCategory(cat: TypeCategory | "Simple", f: F): this {
    let predicate: <I extends Parameters<F>>(a: I) => Boolean = (a) => {
      let currNode = this.getCurrentNode(a);
      return cat === "Simple" ? currNode.type.isSimple() : currNode.type.typeCategory === cat;
    };
    this.onPredicate(predicate, f);
    return this;
  }

  build(): F[] {
    return this.arrayOfFun;
  }
}

export class InitBuilder extends FunctionBuilder<ITransformer["init"]> {

}

export class StepBuilder extends FunctionBuilder<ITransformer["step"]> {
  constructor() {
    super((args) => args[2]);
  }
}

export class ResultBuilder extends FunctionBuilder<ITransformer["result"]> {

}
