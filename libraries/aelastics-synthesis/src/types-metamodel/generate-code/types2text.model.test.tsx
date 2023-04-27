/** @jsx hm */

import { Element, ElementInstance } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import * as t from "../types-meta.model";
import {
  TypeObject,
  Property,
  TypeSupertype,
  TypeModel,
  TypeSubtype,
  TypeOptional,
  TypeOfOptional,
  PropertyDomain,
} from "./../types-components";
import { Context } from "../../jsx/context";
import { ModelStore } from "../../index";
import { generate } from "./../../m2t/text-generation/generate";
import * as m2tmm from "./../../m2t/m2t-model/m2t.meta.model";
import { Types2TextModelTransformations } from "./types2text.model-transformation";

const generateText = async (
  store: ModelStore,
  m: m2tmm.M2T_Model,
  testNumber: number
) => {
  const res = await generate(store, m, {
    rootDir: `Types2Text_${testNumber}`,
    mode: "real",
  });
};

describe("test types2text transormations", () => {
  it("should create correct document", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel1" store={store}></TypeModel>
    );

    const textModel = new Types2TextModelTransformations(store).transform(
      typeModel.render(ctx)
    );

    expect(textModel).toBeDefined();

    await generateText(store, textModel, 1);
  });

  it("should create objects", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel2" store={store}>
        <TypeObject name="Person2"></TypeObject>
        <TypeObject name="Company2"></TypeObject>
      </TypeModel>
    );

    const textModel = new Types2TextModelTransformations(store).transform(
      typeModel.render(ctx)
    );

    expect(textModel).toBeDefined();

    await generateText(store, textModel, 2);
  });

  it("should create subtypes", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel3" store={store}>
        <TypeObject name="Person3"></TypeObject>
        <TypeObject name="Company3"></TypeObject>
        <TypeSubtype name="Worker3">
          <TypeSupertype $refByName="Person3"></TypeSupertype>
        </TypeSubtype>
      </TypeModel>
    );

    const textModel = new Types2TextModelTransformations(store).transform(
      typeModel.render(ctx)
    );

    expect(textModel).toBeDefined();

    await generateText(store, textModel, 3);
  });
});
