// /**
//  *
//  */

// import * as fm2 from "./fm-meta.model-V2.type";

// export let group1: fm2.IGroupFeature = {
//   name: "",
//   subfeatures: [],
//   minCardinality: 0,
//   maxCardinality: 1,
// };

// export let radarAttribute: fm2.IAttribute = {
//   name: "min value",
//   type: "float",
// };

// export let radar: fm2.ISolitaryFeature = {
//   subfeatures: [],
//   attributes: [],
//   name: "Radar",
//   minCardinality: 0,
//   maxCardinality: 1,
// };

// export let adaptiveInGroup: fm2.ISolitaryFeature = {
//   subfeatures: [radar],
//   attributes: [radarAttribute],
//   name: "Adaptive",
//   minCardinality: 0,
//   maxCardinality: 1,
// };

// export let standard: fm2.ISolitaryFeature = {
//   subfeatures: [],
//   attributes: [],
//   name: "Standard",
//   minCardinality: 0,
//   maxCardinality: 1,
// };

// export let groupCruiseControl: fm2.IGroupFeature = {
//   name: "Cruise Control Group",
//   subfeatures: [standard, adaptiveInGroup],
//   minCardinality: 1,
//   maxCardinality: 1,
// };

// export let cruiseControl: fm2.ISolitaryFeature = {
//   subfeatures: [groupCruiseControl],
//   attributes: [],
//   name: "Cruise Control",
//   minCardinality: 0,
//   maxCardinality: 1,
// };

// export let constant: fm2.ISolitaryFeature = {
//   subfeatures: [],
//   attributes: [],
//   name: "Constant",
//   minCardinality: 1,
//   maxCardinality: 1,
// };

// export let rainCtrld: fm2.ISolitaryFeature = {
//   subfeatures: [],
//   attributes: [],
//   name: "Rain-Ctrld",
//   minCardinality: 0,
//   maxCardinality: 1,
// };

// export let adaptive: fm2.ISolitaryFeature = {
//   subfeatures: [rainCtrld],
//   attributes: [],
//   name: "Adaptive",
//   minCardinality: 0,
//   maxCardinality: 1,
// };

// export let wiper: fm2.ISolitaryFeature = {
//   subfeatures: [constant, adaptive],
//   attributes: [],
//   name: "Wiper",
//   minCardinality: 0,
//   maxCardinality: 2,
// };

// export let bodyElectronicsSystem: fm2.ISolitaryFeature = {
//   subfeatures: [wiper, cruiseControl, group1],
//   attributes: undefined,
//   name: "Body Electronics System",
//   minCardinality: 0,
//   maxCardinality: -1,
// };

// export let model: fm2.IFeatureDiagram = {
//   elements: [],
//   name: "Body Electronics System Feature Model ",
// };


// // todo TREBA ISPITISATI TESTOVE
