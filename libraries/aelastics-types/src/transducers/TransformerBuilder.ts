import { ArrayType } from "../complex-types/ArrayType";
import { ObjectType } from "../complex-types/ObjectType";
import { SimpleType } from "../simple-types/SimpleType";
import { IdentityReducer } from "./IdentityReducer";
import { ITransformer } from "./Transformer";

export class TransformerBuilder {
  private initFs: Array<ITransformer["init"]> = [];
  private stepFs: Array<ITransformer["init"]> = [];
  private resultFs: Array<ITransformer["init"]> = [];

  public onInit(f: ITransformer["init"]) {
    this.initFs.push(f);
    return this;
  }
  public getTransformer(): ITransformer {
    return new IdentityReducer();
  }
}

export class InitBuilder {
  private initFs: Array<ITransformer["init"]> = [];

  public onObject(f: ITransformer["init"], type?: ObjectType<any, any>) {
    let resF: ITransformer["init"] = (value, currNode) => {
      if (type && currNode.type === type)
        // TODO: check if it is a subtype of type
        return f(value, currNode);
      else if (type === undefined && currNode.type.typeCategory === "Object")
        return f(value, currNode);
      else return [value, "continue"];
    };
    this.initFs.push(resF);
    return this;
  }

  onArray(f: ITransformer["init"], type?: ArrayType<any>) {
    this.initFs.push(f);
    return this;
  }

  onSimple(f: ITransformer["init"], type?: SimpleType<any, any, any>) {
    this.initFs.push(f);
    return this;
  }

  getInitFun(): ITransformer["init"] {
    return (v, c) => [0, "continue"];
  }
}
