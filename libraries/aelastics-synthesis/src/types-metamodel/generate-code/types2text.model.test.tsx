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

  it("should throw error", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel" store={store}>
        <TypeSubtype name="Worker">
          <TypeSupertype $refByName="Worker"></TypeSupertype>
        </TypeSubtype>
      </TypeModel>
    );

    const textModel = () =>
      new Types2TextModelTransformations(store).transform(
        typeModel.render(ctx)
      );

    expect(textModel).toThrow();
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
        <TypeSubtype name="Worker3"></TypeSubtype>
        <TypeObject name="Person3"></TypeObject>
        <TypeObject name="Company3"></TypeObject>
        <TypeSubtype $refByName="Worker3">
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

  it("should create object properties", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel" store={store}>
        <TypeSubtype name="Worker3">
          <Property name="fullName" />
          <Property name="workInCompany" />
        </TypeSubtype>
        <TypeObject name="Person">
          <Property name="firstName" />
          <Property name="address" />
          <Property name="age" />
        </TypeObject>
        <TypeSubtype $refByName="Worker3">
          <TypeSupertype $refByName="Person3"></TypeSupertype>
        </TypeSubtype>
        <TypeObject name="Company3"></TypeObject>
        <Property $refByName="workInCompany">
          <PropertyDomain $refByName="Company3"></PropertyDomain>
        </Property>
      </TypeModel>
    );

    const textModel = new Types2TextModelTransformations(store).transform(
      typeModel.render(ctx)
    );

    expect(textModel).toBeDefined();

    await generateText(store, textModel, 4);
  });
});
