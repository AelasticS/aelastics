/** @jsx hm */

import { Element, ElementInstance } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import * as fm from "../FM_MetaModel/fm-meta.model-V2.type";

import { FM2TypesTransformations } from "./fm2types-transformation";
import { ModelStore } from "../../jsx/ModelsStore";
import { FeatureDiagram } from "../FM_MetaModel/fm-components";
import { Context } from "../../jsx/context";

const featureModel: Element<fm.IFeatureDiagram> = (
  <FeatureDiagram
    name="Prvi feature dijagram"
    store={new ModelStore()}
  ></FeatureDiagram>
);

const model: fm.IFeatureDiagram = featureModel.render(new Context());

describe("Test model transformations", () => {
  it("tests fm diagram to type model", () => {
    let trans = new FM2TypesTransformations(new ModelStore());
    let result = trans.transform(model);
    expect(result).toHaveProperty("name", "Prvi feature dijagram_type_model");
  });
});
