/**
 *
 */

import * as fm from "./fm-meta.model.type";

// let testFM = new fm.FeatureDiagram();

export let r: fm.IRoot = {
  attributes: [],
  name: "feature root ",
  minCardinality: "1",
  maxCardinality: "1",
};

export let a1: fm.IAttribute = {
  name: "attr1",
  type: "string", // namerno napravljena greska
};

export let f1: fm.ISolitaryFeature = {
  name: "feature",
  minCardinality: "1",
  maxCardinality: "1",
  attributes: [a1],
  parent: r,
};

export let a2: fm.IAttribute = {
  name: "attr2",
  type: "dfsfdfsf",
};

export let f2: fm.ISolitaryFeature = {
  name: "feature drugi",
  minCardinality: "1",
  maxCardinality: "1",
  attributes: [a2],
  parent: r,
};

export let diagram: fm.IFeatureDiagram = {
  elements: [f1, r, f2],
  root: r,
};

export let elGrupe1: fm.IGroupElement = {
  name: "elGrupe1",
  attributes: [],
  minCardinality: "2",
  maxCardinality: "4",
};

export let grupa: fm.IGroupFeature = {
  name: "grupa",
  attributes: [],
  elements: [f1, elGrupe1], // ovde je namerno napravljena greska. Solitary feature (f1) ne bi trebalo da moze da bude element grupe
  minCardinality: "0",
  maxCardinality: "1",
  parent: r,
};

export let grupaPodgrupe: fm.ISolitaryFeature = {
  name: "dete od elementa grupe",
  attributes: [],
  minCardinality: "1",
  maxCardinality: "1",
  parent: elGrupe1,
};
