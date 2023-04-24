/** @jsx hm */

import { Element, ElementInstance } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import * as fm from "../fm-metamodel/fm-meta.model.type";

import { FM2TypesTransformations } from "./fm2types-transformation";
import { ModelStore } from "../../index";
import {
  Attribute,
  FeatureDiagram,
  RootFeature,
  SolitaryFeature,
  GroupFeature,
} from "../fm-metamodel/fm-components";

import * as t from "../../types-metamodel/types-meta.model";
import {
  TypeModel,
  TypeObject,
  TypeOptional,
  TypeOfOptional,
  Property,
  PropertyDomain,
} from "../../types-metamodel/types-components";

import { Context } from "../../jsx/context";

const store = new ModelStore();
const ctx: Context = new Context();
ctx.pushStore(store);

const featureModel: Element<fm.IFeatureDiagram> = (
  <FeatureDiagram name="Body Electronics System Feature Model" store={store}>
    <RootFeature
      name="Body Electronics System"
      minCardinality={0}
      maxCardinality={-1}
    >
      <SolitaryFeature name="Wiper" minCardinality={0} maxCardinality={2}>
        <SolitaryFeature
          name="Constant"
          minCardinality={1}
          maxCardinality={1}
        ></SolitaryFeature>
        <SolitaryFeature name="Adaptive" minCardinality={0} maxCardinality={1}>
          <SolitaryFeature
            name="Rain-Ctrld"
            minCardinality={0}
            maxCardinality={1}
          ></SolitaryFeature>
        </SolitaryFeature>
      </SolitaryFeature>
      <SolitaryFeature
        name="Cruise Control"
        minCardinality={0}
        maxCardinality={1}
      >
        <GroupFeature
          name="Group in Cruise Control"
          minCardinality={1}
          maxCardinality={1}
        >
          <SolitaryFeature
            name="Standard"
            minCardinality={0}
            maxCardinality={1}
          ></SolitaryFeature>
          <SolitaryFeature
            name="Adaptive_Duplicate_line_34"
            minCardinality={0}
            maxCardinality={1}
          >
            <Attribute name="minimalValue" type="string"></Attribute>
            <SolitaryFeature
              name="Radar"
              minCardinality={0}
              maxCardinality={1}
            ></SolitaryFeature>
          </SolitaryFeature>
        </GroupFeature>
      </SolitaryFeature>
    </RootFeature>
  </FeatureDiagram>
);

const typeModel = new FM2TypesTransformations(store).transform(
  featureModel.render(ctx)
);

const outputTypeModelExample1: Element<t.ITypeModel> = (
  <TypeModel name="FirstFMDiagram_type_model">
    <TypeObject name="BodyElectronicsSystem_type">
      <Property
        name="SolitaryWithAttribute_prop"
        domain={<TypeObject name="SolitaryWithAttribute_type"></TypeObject>}
      ></Property>
    </TypeObject>
  </TypeModel>
);

const outputTypeModelExample2: Element<t.ITypeModel> = (
  <TypeModel name="FirstFMDiagram_type_model" store={store}>
    <TypeObject name="BodyElectronicsSystem_type"></TypeObject>
    <TypeOptional>
      <TypeOfOptional $refByName="BodyElectronicsSystem_type" />
    </TypeOptional>
  </TypeModel>
);

const outputTypeModelExample3: Element<t.ITypeModel> = (
  <TypeModel name="FirstFMDiagram_type_model" store={store}></TypeModel>
);

// const model: fm.IFeatureDiagram = featureModel.render(ctx);

describe("Test FM2Type transformations", () => {
  it("Create type model", () => {
    const m1: Element<fm.IFeatureDiagram> = (
      <FeatureDiagram
        name="Body Electronics System Feature Model1"
        store={store}
      ></FeatureDiagram>
    );

    const model = new FM2TypesTransformations(store).transform(m1.render(ctx));

    expect(model).toHaveProperty(
      "name",
      "BodyElectronicsSystemFeatureModel1_type_model"
    );
  });

  it("tests root to type model", () => {
    const m1: Element<fm.IFeatureDiagram> = (
      <FeatureDiagram
        name="Body Electronics System Feature Model2"
        store={store}
      >
        <RootFeature
          name="BodyElectronicsSystem2"
          minCardinality={1}
          maxCardinality={1}
        ></RootFeature>
      </FeatureDiagram>
    );

    const model = new FM2TypesTransformations(store).transform(m1.render(ctx));

    expect(model).toEqual(
      expect.objectContaining({
        name: "BodyElectronicsSystemFeatureModel2_type_model",
        elements: expect.arrayContaining([
          expect.objectContaining({ label: "BodyElectronicsSystem2_type" }),
        ]),
      })
    );
  });

  it("tests root to optional in type model", () => {
    const m1: Element<fm.IFeatureDiagram> = (
      <FeatureDiagram
        name="Body Electronics System Feature Model3"
        store={store}
      >
        <RootFeature
          name="BodyElectronicsSystem3"
          minCardinality={0}
          maxCardinality={1}
        ></RootFeature>
      </FeatureDiagram>
    );

    const model = new FM2TypesTransformations(store).transform(m1.render(ctx));

    expect(model).toEqual(
      expect.objectContaining({
        name: "BodyElectronicsSystemFeatureModel3_type_model",
        elements: expect.arrayContaining([
          expect.objectContaining({ label: "BodyElectronicsSystem3_optional" }),
          expect.objectContaining({ label: "BodyElectronicsSystem3_type" }),
        ]),
      })
    );

    let optional = model.elements.find(
      (e) => e.name == "BodyElectronicsSystem3_optional"
    );

    let type = model.elements.find(
      (e) => e.name == "BodyElectronicsSystem3_type"
    );

    expect((optional as t.IOptional).optionalType).toBe(type);
  });

  it("tests soliratry to object property in type model", () => {
    const m1: Element<fm.IFeatureDiagram> = (
      <FeatureDiagram
        name="Body Electronics System Feature Model4"
        store={store}
      >
        <RootFeature
          name="BodyElectronicsSystem4"
          minCardinality={1}
          maxCardinality={1}
        >
          <SolitaryFeature
            name="Wiper4"
            minCardinality={1}
            maxCardinality={1}
          ></SolitaryFeature>
        </RootFeature>
      </FeatureDiagram>
    );

    const model = new FM2TypesTransformations(store).transform(m1.render(ctx));

    expect(model).toEqual(
      expect.objectContaining({
        name: "BodyElectronicsSystemFeatureModel4_type_model",
        elements: expect.arrayContaining([
          expect.objectContaining({
            label: "BodyElectronicsSystem4_type",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "Wiper4_prop" }),
            ]),
          }),
          expect.objectContaining({ label: "Wiper4_type" }),
        ]),
      })
    );

    let type = model.elements.find((e) => e.name == "Wiper4_type");
    let prop = model.elements.find((e) => e.name == "Wiper4_prop");

    expect((prop as t.IProperty).domain).toBe(type);
  });

  it("tests soliraty to optional object property in type model", () => {
    const m1: Element<fm.IFeatureDiagram> = (
      <FeatureDiagram
        name="Body Electronics System Feature Model5"
        store={store}
      >
        <RootFeature
          name="BodyElectronicsSystem5"
          minCardinality={1}
          maxCardinality={1}
        >
          <SolitaryFeature
            name="Wiper5"
            minCardinality={0}
            maxCardinality={1}
          ></SolitaryFeature>
        </RootFeature>
      </FeatureDiagram>
    );

    const model = new FM2TypesTransformations(store).transform(m1.render(ctx));

    expect(model).toEqual(
      expect.objectContaining({
        name: "BodyElectronicsSystemFeatureModel5_type_model",
        elements: expect.arrayContaining([
          expect.objectContaining({
            label: "BodyElectronicsSystem5_type",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "Wiper5_prop" }),
            ]),
          }),
          expect.objectContaining({ label: "Wiper5_type" }),
          expect.objectContaining({ label: "Wiper5_optional" }),
        ]),
      })
    );

    let type = model.elements.find((e) => e.name == "Wiper5_optional");
    let prop = model.elements.find((e) => e.name == "Wiper5_prop");

    expect((prop as t.IProperty).domain).toBe(type);
  });

  it("tests solitary to array object property in type model", () => {
    const m1: Element<fm.IFeatureDiagram> = (
      <FeatureDiagram
        name="Body Electronics System Feature Model6"
        store={store}
      >
        <RootFeature
          name="BodyElectronicsSystem6"
          minCardinality={1}
          maxCardinality={1}
        >
          <SolitaryFeature
            name="Wiper6"
            minCardinality={1}
            maxCardinality={4}
          ></SolitaryFeature>
        </RootFeature>
      </FeatureDiagram>
    );

    const model = new FM2TypesTransformations(store).transform(m1.render(ctx));

    expect(model).toEqual(
      expect.objectContaining({
        name: "BodyElectronicsSystemFeatureModel6_type_model",
        elements: expect.arrayContaining([
          expect.objectContaining({
            label: "BodyElectronicsSystem6_type",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "Wiper6_prop" }),
            ]),
          }),
          expect.objectContaining({ label: "Wiper6_type" }),
          expect.objectContaining({ label: "Wiper6_array" }),
        ]),
      })
    );

    let array = model.elements.find((e) => e.name == "Wiper6_array");
    let type = model.elements.find((e) => e.name == "Wiper6_type");
    let prop = model.elements.find((e) => e.name == "Wiper6_prop");

    expect((prop as t.IProperty).domain).toBe(array);
    expect((array as t.IArray).elementType).toBe(type);
  });

  it("test attribute to object property", () => {
    const m1: Element<fm.IFeatureDiagram> = (
      <FeatureDiagram
        name="Body Electronics System Feature Model7"
        store={store}
      >
        <RootFeature
          name="BodyElectronicsSystem7"
          minCardinality={1}
          maxCardinality={1}
        >
          <SolitaryFeature name="Wiper7" minCardinality={1} maxCardinality={4}>
            <Attribute name="numberOfLevels7" type="number"></Attribute>
          </SolitaryFeature>
        </RootFeature>
      </FeatureDiagram>
    );

    const model = new FM2TypesTransformations(store).transform(m1.render(ctx));

    expect(model).toEqual(
      expect.objectContaining({
        name: "BodyElectronicsSystemFeatureModel7_type_model",
        elements: expect.arrayContaining([
          expect.objectContaining({
            label: "BodyElectronicsSystem7_type",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "Wiper7_prop" }),
            ]),
          }),
          expect.objectContaining({
            label: "Wiper7_type",
            properties: expect.arrayContaining([
              expect.objectContaining({ name: "numberOfLevels7_attr" }),
            ]),
          }),
          expect.objectContaining({ label: "Wiper7_array" }),
        ]),
      })
    );

    let type = model.elements.find((e) => e.name == "number");
    let attr = model.elements.find((e) => e.name == "numberOfLevels7_attr");

    expect((attr as t.IProperty).domain).toBe(type);
  });

  it("tests export output model to JSX", async () => {    

    const resJSX = store.exportToJSX(typeModel);
    console.log(resJSX);
    expect(resJSX).toBeDefined();
  });

  // // TODO Example 1 of result type model
  // const resultTypeModel: Element<t.ITypeModel> = (
  // <TypeModel name="FirstFMDiagram_type_model" store={store}>
  //   <TypeOptional
  //     optionalType={
  //       <TypeObject name="BodyElectronicsSystem_type"></TypeObject>
  //     }
  //   ></TypeOptional>
  // </TypeModel>
  // );

  // expect(result).toEqual(resultTypeModel.render(ctx));
  // });
});
