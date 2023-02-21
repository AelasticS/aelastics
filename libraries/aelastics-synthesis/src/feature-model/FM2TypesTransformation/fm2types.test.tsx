/** @jsx hm */

import { Element, ElementInstance } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import * as fm from "../FM_MetaModel/fm-meta.model.type";

import { FM2TypesTransformations } from "./fm2types-transformation";
import { ModelStore } from "../../jsx/ModelsStore";
import {
  FeatureDiagram,
  RootFeature,
  SolitaryFeature,
} from "../FM_MetaModel/fm-components";
import { Context } from "../../jsx/context";

const store = new ModelStore();

const featureModel: Element<fm.IFeatureDiagram> = (
  <FeatureDiagram name="FirstFMDiagram" store={store}>
    <RootFeature
      name="Body Electronics System"
      minCardinality={1}
      maxCardinality={-1}
    ></RootFeature>
  </FeatureDiagram>
);

const model: fm.IFeatureDiagram = featureModel.render(new Context());

describe("Test model transformations", () => {
  it("tests fm diagram to type model", () => {
    let trans = new FM2TypesTransformations(store);
    let result = trans.transform(model);
    expect(result).toHaveProperty("name", "FirstFMDiagram_type_model");
  });
});
