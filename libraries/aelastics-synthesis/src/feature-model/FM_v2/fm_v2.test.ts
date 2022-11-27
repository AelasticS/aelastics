/**
 *
 */

import * as fm2 from "./fm-meta.model-V2.type";

export let group1: fm2.IGroupFeature = {
  // attributes: [],  grupa ne moze da ima attr, pa je promenjen MM
  name: "", // grupa nema smisla da ima name, ali moze da se koristi kao opis
  children: [],
  minCardinality: "0",
  maxCardinality: "1",
};

export let radarAttribute: fm2.IAttribute = {
  name: "min value",
  type: "float",
};

export let radar: fm2.ISolitaryFeature = {
  children: [],
  attributes: [],
  name: "Radar",
  minCardinality: "0",
  maxCardinality: "1", // nije po ogranicenju
};

export let adaptiveInGroup: fm2.ISolitaryFeature = {
  children: [radar],
  attributes: [radarAttribute],
  name: "Adaptive",
  minCardinality: "0",
  maxCardinality: "1", // nije po ogranicenju
};

export let standard: fm2.ISolitaryFeature = {
  children: [],
  attributes: [],
  name: "Standard",
  minCardinality: "0",
  maxCardinality: "1", // nije po ogranicenju
};

export let groupCruiseControl: fm2.IGroupFeature = {
  name: "", // grupa nema smisla da ima name, ali moze da se koristi kao opis
  children: [standard, adaptiveInGroup],
  minCardinality: "1",
  maxCardinality: "1",
};

export let cruiseControl: fm2.ISolitaryFeature = {
  children: [groupCruiseControl],
  attributes: [],
  name: "Cruise Control",
  minCardinality: "0",
  maxCardinality: "1", // nije po ogranicenju
};

export let constant: fm2.ISolitaryFeature = {
  children: [],
  attributes: [],
  name: "Constant",
  minCardinality: "1",
  maxCardinality: "1",
};

export let rainCtrld: fm2.ISolitaryFeature = {
  children: [],
  attributes: [],
  name: "Rain-Ctrld",
  minCardinality: "0",
  maxCardinality: "1", // nije po ogranicenju
};

export let adaptive: fm2.ISolitaryFeature = {
  children: [rainCtrld],
  attributes: [],
  name: "Adaptive",
  minCardinality: "0",
  maxCardinality: "1", // nije po ogranicenju
};

export let wiper: fm2.ISolitaryFeature = {
  children: [constant, adaptive],
  attributes: [],
  name: "Wiper",
  minCardinality: "0",
  maxCardinality: "2", // nije po ogranicenju
};

export let bodyElectronicsSystem: fm2.ISolitaryFeature = {
  children: [wiper, cruiseControl, group1],
  attributes: [],
  name: "Body Electronics System",
  minCardinality: "0",
  maxCardinality: "*",
};

export let model: fm2.IFeatureDiagram = {
  elements: [],
  root: bodyElectronicsSystem,
};
