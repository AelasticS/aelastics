/** @jsx hm */

import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import * as fm from "./fm-meta.model-V2.type";
import {
  Attribute,
  FeatureDiagram,
  GroupFeature,
  RootFeature,
  SolitaryFeature,
} from "./fm-components";
import { Context } from "../../jsx/context";
import { ModelStore } from "../../jsx/ModelsStore";

const testStore = new ModelStore();

const fmModelDiagram: Element<fm.IFeatureDiagram> = (
  <FeatureDiagram
    name="Body Electronics System Feature Model"
    store={testStore}
  >
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
            name="Adaptive"
            minCardinality={0}
            maxCardinality={1}
          >
            <Attribute name="Najmanja vrednost" type="string"></Attribute>
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

let m1: fm.IFeatureDiagram = fmModelDiagram.render(new Context());

describe("FM compontents", () => {
  it("tests FM diagram instance", () => {
    expect(m1).toHaveProperty("label", "Body Electronics System Feature Model");
  });

  it("tests FM root element", () => {
    expect(m1).toEqual(
      expect.objectContaining({
        label: "Body Electronics System Feature Model",
        elements: expect.arrayContaining([
          expect.objectContaining({ label: "Body Electronics System" }),
        ]),
      })
    );
  });

  it("tests FM elements", () => {
    expect(m1).toEqual(
      expect.objectContaining({
        label: "Body Electronics System Feature Model",
        elements: expect.arrayContaining([
          expect.objectContaining({
            label: "Body Electronics System",
            subfeatures: expect.arrayContaining([
              expect.objectContaining({
                name: "Wiper",
                minCardinality: 0,
                maxCardinality: 2,
              }),
              expect.objectContaining({ label: "Cruise Control" }),
            ]),
          }),
        ]),
      })
    );
  });

});
