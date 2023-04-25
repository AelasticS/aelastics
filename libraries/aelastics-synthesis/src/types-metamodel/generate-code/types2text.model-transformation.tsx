/** @jsx hm */
import { hm } from "../../jsx/handle";
import { M2T, Dir, Doc, P, Sec } from "../../m2t/m2t-model/m2t.jsx.js";
import * as m2t from "../../m2t/m2t-model/m2t.meta.model";
import * as tmm from "../types-meta.model";
import { ModelStore, Context, Element } from "../../index";
import { abstractM2M } from "../../transformations/abstractM2M";
import { SpecPoint, SpecOption } from "../../transformations/spec-decorators";

export class Types2TextModelTransformations extends abstractM2M<
  tmm.ITypeModel,
  m2t.M2T_Model
> {
  constructor(store: ModelStore) {
    super(store);
  }

  template(tm: tmm.ITypeModel) {
    return (
      <M2T name={tm.name + "_textModel"}>
        <Doc name={tm.name + "_textModel.tsx"}>
          <P>import * as t from "aelastics-types";</P>
          <P>
            `export const ${tm.name}_Schema = t.schema("${tm.name}_Schema");`
          </P>
        </Doc>
      </M2T>
    );
  }

  @SpecPoint()
  transformType(t: tmm.IType): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  @SpecOption("transformType", tmm.Object)
  transformObject(t: tmm.IObject): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  @SpecOption("transformType", tmm.Array)
  transformArray(t: tmm.IArray): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  @SpecOption("transformType", tmm.Subtype)
  transformSubtype(t: tmm.ISubtype): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  @SpecOption("transformType", tmm.Optional)
  transformOptional(t: tmm.IOptional): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  @SpecOption("transformType", tmm.Union)
  transformUnion(t: tmm.IUnion): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }

  transformProperty(t: tmm.IProperty): Element<m2t.IM2T_Item> {
    return <Sec></Sec>;
  }
}
