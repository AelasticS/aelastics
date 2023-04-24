/** @jsx hm */
import { hm } from "../../jsx/handle";
import { M2T, Dir, Doc, P, Sec } from "../../m2t/m2t-model/m2t.jsx.js";
import * as m2t from "../../m2t/m2t-model/m2t.meta.model";
import * as tmm from "../types-meta.model";
import { ModelStore, Context, Element, SpecPoint } from "../../index";
import { abstractM2M } from "../../transformations/abstractM2M";

export class Types2TextModelTransformations extends abstractM2M<
  tmm.ITypeModel,
  m2t.M2T_Model
> {
  constructor(store: ModelStore) {
    super(store);
  }

  template(tm: tmm.ITypeModel) {
    return <M2T name={tm.name + "_textModel"}></M2T>;
  }

  transformType(t: tmm.IType): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  transformObject(t: tmm.IObject): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  transformArray(t: tmm.IArray): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  transformProperty(t: tmm.IProperty): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  transformSubtype(t: tmm.ISubtype): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  transformOptional(t: tmm.IOptional): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  transformUnion(t: tmm.IUnion): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }
}
