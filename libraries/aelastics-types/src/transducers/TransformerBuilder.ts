import { Any } from "../common/DefinitionAPI";
import { Node } from "../common/Node";
import { ArrayType } from "../complex-types/ArrayType";
import { ObjectType } from "../complex-types/ObjectType";
import { SimpleType } from "../simple-types/SimpleType";
import { TypeCategory } from "../type/TypeDefinisions";
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
  public build(): ITransformer {
    return new IdentityReducer();
  }
}

export class InitBuilder {
  private initFs: Array<ITransformer["init"]> = [];

  public onPredicate(p: (value: any, currNode: Node) => Boolean, fun: ITransformer["init"]) {
    let resF: ITransformer["init"] = (value, currNode) => {
      if (p(value, currNode)) return fun(value, currNode);
      else return [value, "continue"];
    };
    this.initFs.push(resF);
    return this;
  }

  public readonly onType = (type: Any, f: ITransformer["init"]) =>
    this.onPredicate((_, currNode) => currNode.type === type, f);

  public readonly onTypeCategory = (cat: TypeCategory | "Simple", f: ITransformer["init"]) =>
    this.onPredicate(
      (_, currNode) =>
        cat === "Simple" ? currNode.type.isSimple() : currNode.type.typeCategory === cat,
      f
    );

  build(): ITransformer["init"] {
    return (v, c) => [0, "continue"];
  }
}
