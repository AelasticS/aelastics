/**
 *
 */

import * as fm from "./fm-meta.model.type";

// let testFM = new fm.FeatureDiagram();

describe("First test of FM metamodel", () => {
  test("test1", () => {
    let r: fm.IRoot = {
      attributes: [],
      name: "feature root ",
      minCardinality: "1",
      maxCardinality: "1",
    };

    let a1: fm.IAttribute = {
      name: "attr1",
      type: "string", // namerno napravljena greska
    };

    let f1: fm.ISolitaryFeature = {
      name: "feature",
      minCardinality: "1",
      maxCardinality: "1",
      attributes: [a1],
      parent: r,
    };

    let a2: fm.IAttribute = {
      name: "attr2",
      type: "dfsfdfsf",
    };

    let f2: fm.ISolitaryFeature = {
      name: "feature drugi",
      minCardinality: "1",
      maxCardinality: "1",
      attributes: [a2],
      parent: r,
    };

    let diagram: fm.IFeatureDiagram = {
      elements: [f1, r, f2],
      root: r,
    };

    let elGrupe1: fm.IGroupElement = {
      name: "elGrupe1",
      attributes: [],
      minCardinality: "2",
      maxCardinality: "4",
    };

    let grupa: fm.IGroupFeature = {
      name: "grupa",
      attributes: [],
      elements: [f1, elGrupe1], // ovde je namerno napravljena greska. Solitary feature (f1) ne bi trebalo da moze da bude element grupe
      minCardinality: "0",
      maxCardinality: "1",
      parent: r,
    };

    let grupaPodgrupe: fm.ISolitaryFeature = {
      name: "dete od elementa grupe",
      attributes: [],
      minCardinality: "1",
      maxCardinality: "1",
      parent: elGrupe1,
    };

    console.log("proba testa");
    expect(true).toBeTruthy;
  });
});
