/*
 * Author: Sinisa Neskovic
 *
 * Copyright (c) 2023 Aelastics
 */

import { Any } from "../common/DefinitionAPI";
import { Node } from "../common/Node";
import { TypeCategory } from "../type/TypeDefinisions";
import { IProcessor, ProcessorClass, WhatToDo } from "./Processor";

export class ProcessorBuilder {
  private initFs: Array<IProcessor["init"]> = [];
  private stepFs: Array<IProcessor["step"]> = [];
  private resultFs: Array<IProcessor["result"]> = [];

  public onInit(f: IProcessor["init"] | Array<IProcessor["init"]>) {
    Array.isArray(f) ? this.initFs.push(...f) : this.initFs.push(f);
    return this;
  }

  public onStep(f: IProcessor["step"] | Array<IProcessor["step"]>) {
    Array.isArray(f) ? this.stepFs.push(...f) : this.stepFs.push(f);
    return this;
  }
  public onResult(f: IProcessor["result"] | Array<IProcessor["result"]>) {
    Array.isArray(f) ? this.resultFs.push(...f) : this.resultFs.push(f);
    return this;
  }

  

  private createTransformClass(
    initFs: Array<IProcessor["init"]>,
    stepFs: Array<IProcessor["step"]>,
    resultFs: Array<IProcessor["result"]>
  ): ProcessorClass {
    return class implements IProcessor {
      private args:any[]
      constructor(readonly xfNext: IProcessor, ...args:any[]) {
        this.args = args
      }

      private runInits: IProcessor["init"] = (value, currNode) => {
        let what: WhatToDo = "continue";
        for (let i = 0; i < initFs.length && what === "continue"; i++) {
          [value, what] = initFs[i](value, currNode, ...this.args);
        }
        return [value, what];
      };
    
      private runSteps: IProcessor["step"] = (result, currNode, item) => {
        let what: WhatToDo = "continue";
        for (let i = 0; i < stepFs.length && what === "continue"; i++) {
          [result, what] = stepFs[i](result, currNode, item, ...this.args);
        }
        return [result, what];
      };
    
      private runResults: IProcessor["result"] = (result, currNode) => {
        let what: WhatToDo = "continue";
        for (let i = 0; i < resultFs.length && what === "continue"; i++) {
          [result, what] = resultFs[i](result, currNode,...this.args);
        }
        return [result, what];
      };

      public init = (input: any, currNode: Node): [any, WhatToDo] => {
        let [output, w] = this.runInits(input, currNode);
        if (w === "continue") return this.xfNext.init(output, currNode);
        else return [output, w];
      };

      public result(input: any, currNode: Node): [any, WhatToDo] {
        let [output, w] = this.runResults(input, currNode);
        if (w === "continue") return this.xfNext.result(output, currNode);
        else return [output, w];
      }

      public step(input: any, currNode: Node, item: any): [any, WhatToDo] {
        let [output, w] = this.runSteps(input, currNode, item);
        if (w === "continue") return this.xfNext.step(output, currNode, item);
        else return [output, w];
      }
    };
  }

  public build():ProcessorClass {
    return this.createTransformClass(this.initFs, this.stepFs, this.resultFs);
  }
}

type FunctionType<T extends any[]> = (args: T) => [any, WhatToDo];

abstract class FunctionBuilder<F extends (...args: any[]) => [any, WhatToDo]> {
  private arrayOfFun: Array<F> = [];
  //private initFs: Array<FunctionType<Parameters<F>, ReturnType<F>>> = [];
  private getValue: (args: any[]) => any = (args) => args[0];
  private getCurrentNode: (args: any[]) => Node = (args) => args[1] // (args.length > 2 ? args[2] : args[1]);

  public onPredicate(predicate: <I extends Parameters<F>>(...a: I) => Boolean, fun: F): this {
    let resF = <F>((...args: Parameters<F>): [any, WhatToDo] => {
      if (predicate(...args)) return fun(...args);
      else return [this.getValue(args), "continue"];
    });
    this.arrayOfFun.push(resF);
    return this;
  }

  public onType(type: Any, f: F): this {
    let predicate: <I extends Parameters<F>>(...a: I) => Boolean = (...a) => {
      return this.getCurrentNode(a).type === type;
    };
    this.onPredicate(predicate, f);
    return this;
  }

  public onTypeCategory(cat: TypeCategory | "Simple", f: F): this {
    let predicate: <I extends Parameters<F>>(...a: I) => Boolean = (...a) => {
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

export class InitBuilder extends FunctionBuilder<IProcessor["init"]> {}

export class StepBuilder extends FunctionBuilder<IProcessor["step"]> {}

export class ResultBuilder extends FunctionBuilder<IProcessor["result"]> {}
