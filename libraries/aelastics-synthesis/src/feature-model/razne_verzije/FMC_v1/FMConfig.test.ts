import * as fmConfig from "./fm-configuration-meta.model";
import * as featureModel from "../FM_v1/FM.test";

let conf1: fmConfig.IFMConfiguration = {
  forModel: featureModel.diagram,
  name: "moja konfiguracija",
  selectedFeatures: [],
};

let cAttr1: fmConfig.IAttribute = {
  name: "moj Attribute",
  value: "vrednost attr",
  reference: featureModel.a1,
};

let sf1: fmConfig.IGroupFeature = {
  attributes: [cAttr1],
  name: "odabrani solitary feature",
  reference: featureModel.f1,
  children: [],
};

describe("FMC gf v1 test", () => {
  it("tests example", () => {
    expect(true).toBeTruthy();
  });
});
