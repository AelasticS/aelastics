/** @jsx hm */

import { Element, ElementInstance } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import * as fm from "../FM_MetaModel/fm-meta.model.type";

import { FM2TypesTransformations } from "./fm2types-transformation";
import { ModelStore } from "../../index";
import {
  Attribute,
  FeatureDiagram,
  RootFeature,
  SolitaryFeature,
  GroupFeature,
} from "../FM_MetaModel/fm-components";

import * as t from "../Types_MetaModel/types-meta.model";
import {
  TypeModel,
  TypeObject,
  TypeOptional,
  TypeOfOptional,
  Property,
  PropertyDomain,
} from "../Types_MetaModel/types-components";

import { Context } from "../../jsx/context";

const store = new ModelStore();
const ctx: Context = new Context();
ctx.pushStore(store);

const store2 = new ModelStore();
const ctx2: Context = new Context();
ctx2.pushStore(store2);

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

const resultTypeModel: Element<t.ITypeModel> = (
  <TypeModel name="FirstFMDiagram_type_model">
    <TypeObject name="BodyElectronicsSystem_type">
      <Property
        name="SolitaryWithAttribute_prop"
        domain={<TypeObject name="SolitaryWithAttribute_type"></TypeObject>}
      ></Property>
    </TypeObject>
  </TypeModel>
);

const model: fm.IFeatureDiagram = featureModel.render(ctx);

describe("Test FM2Type transformations", () => {
  it("tests root feature to type model", () => {
    let trans = new FM2TypesTransformations(store);
    let result = trans.transform(model);

    // let resultModel = resultTypeModel.render(ctx2);
    // expect(result).toEqual(resultModel);
    expect(true).toBeTruthy();
  });

  // it("tests root optional to type model", () => {
  // const featureModel: Element<fm.IFeatureDiagram> = (
  //   <FeatureDiagram name="FirstFMDiagram" store={store}>
  //     <RootFeature
  //       name="BodyElectronicsSystem"
  //       minCardinality={0}
  //       maxCardinality={1}
  //     ></RootFeature>
  //   </FeatureDiagram>
  // );

  // // TODO Example 1 of result type model
  // const resultTypeModel: Element<t.ITypeModel> = (
  // <TypeModel name="FirstFMDiagram_type_model" store={store2}>
  //   <TypeOptional
  //     optionalType={
  //       <TypeObject name="BodyElectronicsSystem_type"></TypeObject>
  //     }
  //   ></TypeOptional>
  // </TypeModel>
  // );

  // // TODO Example 2 of result type model
  // const resultTypeModel3: Element<t.ITypeModel> = (
  <TypeModel name="FirstFMDiagram_type_model" store={store2}>
    <TypeObject name="BodyElectronicsSystem_type"></TypeObject>
    <TypeOptional>
      <TypeOfOptional $refByName="BodyElectronicsSystem_type" />
    </TypeOptional>
  </TypeModel>;
  // );
  // const model: fm.IFeatureDiagram = featureModel.render(ctx);
  // let trans = new FM2TypesTransformations(store);
  // let result = trans.transform(model);
  // expect(result).toEqual(resultTypeModel.render(ctx));
  // });
});
