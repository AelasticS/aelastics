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
  TypeArray,
  ArrayElementType,
} from "./../types-components";
import { Context } from "../../jsx/context";
import { ModelStore } from "../../index";
import { generate } from "./../../m2t/text-generation/generate";
import * as m2tmm from "./../../m2t/m2t-model/m2t.meta.model";
import { Types2TextModelTransformations } from "./types2text.model-transformation";
import { importPredefinedTypes } from "./../predefined-model";

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
        <TypeObject name="StringObject"></TypeObject>
        <TypeObject name="Person2">
          <Property name="firstName">
            <PropertyDomain $refByName="StringObject" />
          </Property>
        </TypeObject>
        <TypeObject name="Company2">
          <Property name="name">
            <PropertyDomain $refByName="StringObject" />
          </Property>
        </TypeObject>
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
      <TypeModel name="FirstTypeModel" store={store}>
        <TypeSubtype name="Worker"></TypeSubtype>
        <TypeObject name="Person">
          <Property name="name">
            <PropertyDomain $refByName="Worker"></PropertyDomain>
          </Property>
        </TypeObject>
        <TypeObject name="Company"></TypeObject>
        <TypeSubtype $refByName="Worker">
          <TypeSupertype $refByName="Person"></TypeSupertype>
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
        {importPredefinedTypes("../FirstTypeModel")}
        <TypeSubtype name="Worker3">
          <Property name="fullName">
            <PropertyDomain $refByName="string" />
          </Property>
          <Property name="workInCompany" />
        </TypeSubtype>
        <TypeObject name="Person3">
          <Property name="firstName">
            <PropertyDomain $refByName="string" />
          </Property>
          <Property name="address">
            <PropertyDomain $refByName="string" />
          </Property>
          <Property name="age">
            <PropertyDomain $refByName="number" />
          </Property>
        </TypeObject>
        <TypeSubtype $refByName="Worker3">
          <TypeSupertype $refByName="Person3"></TypeSupertype>
        </TypeSubtype>
        <TypeObject name="Company3"></TypeObject>
        <Property $refByName="workInCompany">
          <PropertyDomain $refByName="Company3"></PropertyDomain>
        </Property>
        <TypeSubtype $refByName="Worker3">
          <Property name="placeOfBirth">
            <PropertyDomain $refByName="string" />
          </Property>
        </TypeSubtype>
      </TypeModel>
    );

    const textModel = new Types2TextModelTransformations(store).transform(
      typeModel.render(ctx)
    );

    expect(textModel).toBeDefined();

    await generateText(store, textModel, 4);
  });

  it("detect circular dependencies", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel" store={store}>
        {importPredefinedTypes("../FirstTypeModel")}
        <TypeSubtype name="Worker">
          <Property name="fullName2">
            <PropertyDomain $refByName="string" />
          </Property>
          <Property name="workInCompany" />
        </TypeSubtype>
        <TypeSubtype name="Driver">
          <Property name="fullName">
            <PropertyDomain $refByName="string" />
          </Property>
        </TypeSubtype>
        <TypeObject name="Person">
          <Property name="firstName">
            <PropertyDomain $refByName="string" />
          </Property>
          <Property name="address">
            <PropertyDomain $refByName="string" />
          </Property>
          <Property name="age">
            <PropertyDomain $refByName="number" />
          </Property>
        </TypeObject>
        <TypeSubtype $refByName="Driver">
          <TypeSupertype $refByName="Worker"></TypeSupertype>
        </TypeSubtype>
        <TypeSubtype $refByName="Worker">
          <TypeSupertype $refByName="Driver"></TypeSupertype>
        </TypeSubtype>
        <TypeObject name="Company"></TypeObject>
        <Property $refByName="workInCompany">
          <PropertyDomain $refByName="Company"></PropertyDomain>
        </Property>
        <TypeSubtype $refByName="Worker">
          <Property name="placeOfBirth">
            <PropertyDomain $refByName="string" />
          </Property>
        </TypeSubtype>
      </TypeModel>
    );

    const textModel = () =>
      new Types2TextModelTransformations(store).transform(
        typeModel.render(ctx)
      );

    expect(textModel).toThrow();
  });

  it("should create optional", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel" store={store}>
        <TypeSubtype name="Worker"></TypeSubtype>
        <TypeObject name="Person">
          <Property name="name">
            <PropertyDomain $refByName="Worker"></PropertyDomain>
          </Property>
        </TypeObject>
        <TypeObject name="Company"></TypeObject>
        <TypeOptional name="OptionalCompany">
          <TypeOfOptional $refByName="Company" />
        </TypeOptional>
        <TypeOptional name="OptionalOptionalCompany">
          <TypeOfOptional $refByName="OptionalCompany" />
        </TypeOptional>
        <TypeSubtype $refByName="Worker">
          <Property name="employeedIn">
            <PropertyDomain $refByName="OptionalOptionalCompany"></PropertyDomain>
          </Property>
          <TypeSupertype $refByName="Person"></TypeSupertype>
        </TypeSubtype>
      </TypeModel>
    );

    const textModel = new Types2TextModelTransformations(store).transform(
      typeModel.render(ctx)
    );

    expect(textModel).toBeDefined();

    await generateText(store, textModel, 5);
  });

  it("should create array", async () => {
    const store = new ModelStore();
    const ctx = new Context();
    ctx.pushStore(store);

    const typeModel: Element<t.ITypeModel> = (
      <TypeModel name="FirstTypeModel" store={store}>
        <TypeObject name="Company"></TypeObject>
        <TypeSubtype name="Worker"></TypeSubtype>
        <TypeObject name="Person">
          <Property name="name">
            <PropertyDomain $refByName="Worker"></PropertyDomain>
          </Property>
        </TypeObject>
        <TypeOptional name="OptionalCompany">
          <TypeOfOptional $refByName="Company" />
        </TypeOptional>

        <TypeArray name="ArrayOfOptionalCompanies">
          <ArrayElementType $refByName="OptionalCompany"></ArrayElementType>
        </TypeArray>

        <TypeOptional name="OptionalArrayOfOptionalCompanies">
          <TypeOfOptional $refByName="ArrayOfOptionalCompanies"></TypeOfOptional>
        </TypeOptional>

        <TypeSubtype $refByName="Worker">
          <Property name="employeedIn">
            <PropertyDomain $refByName="OptionalArrayOfOptionalCompanies"></PropertyDomain>
          </Property>
          <TypeSupertype $refByName="Person"></TypeSupertype>
        </TypeSubtype>
      </TypeModel>
    );

    const textModel = new Types2TextModelTransformations(store).transform(
      typeModel.render(ctx)
    );

    expect(textModel).toBeDefined();

    await generateText(store, textModel, 6);
  });
});
