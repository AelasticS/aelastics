import { Any } from "../common/DefinitionAPI";
import { Node } from "../common/Node";
import { ArrayType } from "../complex-types/ArrayType";
import { ObjectType } from "../complex-types/ObjectType";
import { SimpleType } from "../simple-types/SimpleType";
import { TypeCategory } from "../type/TypeDefinisions";
import { IdentityReducer } from "./IdentityReducer";
import { IProcessor, WhatToDo } from "./Processor";

export class ProcessorBuilder {
    private initFs: Array<IProcessor["init"]> = [];
    private stepFs: Array<IProcessor["step"]> = [];
    private resultFs: Array<IProcessor["result"]> = [];
  
    public onInit(f: IProcessor["init"] | Array<IProcessor["init"]>) {
      Array.isArray(f)? this.initFs.push(...f): this.initFs.push(f);
      return this;
    }
  
    public onStep(f: IProcessor["step"]) {
      Array.isArray(f)? this.stepFs.push(...f): this.stepFs.push(f);
      return this;
    }
    public onResult(f: IProcessor["result"]) {
      Array.isArray(f)? this.resultFs.push(...f): this.resultFs.push(f);
      return this;
    }
  
    private runInits: IProcessor["init"] = (value, currNode) => {
      let what: WhatToDo = "continue";
      for (let i = 0; i < this.initFs.length && what === "continue"; i++) {
        [value, what] = this.initFs[i](value, currNode);
      }
      return [value, what];
    };
  
    private runSteps: IProcessor["step"] = (result, item, currNode) => {
      let what: WhatToDo = "continue";
      for (let i = 0; i < this.stepFs.length && what === "continue"; i++) {
        [result, what] = this.stepFs[i](result, item, currNode);
      }
      return [result, what];
    };
  
    private runResults: IProcessor["result"] = (result, currNode) => {
      let what: WhatToDo = "continue";
      for (let i = 0; i < this.resultFs.length && what === "continue"; i++) {
        [result, what] = this.resultFs[i](result, currNode);
      }
      return [result, what];
    };
  
    public build(): IProcessor {
      return {
        init: this.runInits,
        step: this.runSteps,
        result: this.runResults,
      };
    }
  }
  

export class InitBuilder {
  private initFs: Array<IProcessor["init"]> = [];

  public onPredicate(p: (value: any, currNode: Node) => Boolean, fun: IProcessor["init"]) {
    let resF: IProcessor["init"] = (value, currNode) => {
      if (p(value, currNode)) return fun(value, currNode);
      else return [value, "continue"];
    };
    this.initFs.push(resF);
    return this;
  }

  public readonly onType = (type: Any, f: IProcessor["init"]) =>
    this.onPredicate((_value, currNode) => currNode.type === type, f);

  public readonly onTypeCategory = (cat: TypeCategory | "Simple", f: IProcessor["init"]) =>
    this.onPredicate(
      (_value, currNode) =>
        cat === "Simple" ? currNode.type.isSimple() : currNode.type.typeCategory === cat,
      f
    );

  build(): IProcessor["init"] {
    return (v, c) => [0, "continue"];
  }
}
