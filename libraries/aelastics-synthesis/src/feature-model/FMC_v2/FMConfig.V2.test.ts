/**
 *
 */

import * as fmc from "./fm-configuration-meta.mode.V2";
import * as fm from "../FM_MetaModel/fm_instance.test";

let RainControl: fmc.ISolitaryFeature = {
  children: [],
  reference: fm.rainCtrld,
};

let adaptive: fmc.ISolitaryFeature = {
  children: [RainControl],
  reference: fm.adaptive,
};

let wiper: fmc.ISolitaryFeature = {
  children: [adaptive],
  reference: fm.wiper,
};

let adaptiveInGroup: fmc.ISolitaryFeature = {
  children: [],
  reference: fm.adaptiveInGroup,
};

let gropu1: fmc.IGroupFeature = {
  children: [adaptiveInGroup],
  reference: fm.rainCtrld,
};

let cruiseControl: fmc.ISolitaryFeature = {
  children: [gropu1],
  reference: fm.cruiseControl,
};

let bodyElectronicsSystem: fmc.ISolitaryFeature = {
  children: [wiper, cruiseControl],
  reference: fm.bodyElectronicsSystem,
};

let fmConfig: fmc.IFMConfiguration = {
  forModel: fm.model,
  name: "test v2 FM",
  selectedFeatures: [bodyElectronicsSystem],
};

const expStructure = {
  and: [],
  or: [],
};

const checkIfCruiseControlIsEnabled = (
  model: fmc.IFMConfiguration
): boolean => {
  if (model.selectedFeatures.length === 0) {
    return false;
  }

  const root = model.selectedFeatures.find((element: fmc.ISelectedFeature) => {
    return element.reference.name == "Body Electronics System";
  });

  if (!root) {
    return false;
  }

  const wiper = root.children
    .find((element: fmc.ISelectedFeature) => element.reference.name == "Wiper")
    ?.children.find((element: fmc.ISelectedFeature) => {
      return element.reference.name == "Adaptive";
    });

  if (!wiper) {
    return false;
  }

  const rainCtrld = adaptive.children.find((element: fmc.ISelectedFeature) => {
    return element.reference.name == "Rain-Ctrld";
  });

  if (!rainCtrld) {
    return false;
  }

  const cruiseControl = root.children.find((element: fmc.ISelectedFeature) => {
    return element.reference.name == "Cruise Control";
  });

  if (!cruiseControl) {
    return false;
  }

  return true;
};

const exp = {
  operation: "and",
  statements: [
    "Body Electronics System.Wiper.Adaptive.Rain-Ctrld",
    "Body Electronics System.Cruise Control",
  ],
};

const validateExpression = (
  expression: any,
  model: fmc.IFMConfiguration
): boolean => {
  // simple statement
  if (expression.operation === undefined) {
    return true;
  } else {
    // let operation = expression.operation == "and" ? "&&" : "||";

    if (expression.operation == "and") {
      return expression.statements.every(
        (element: any, index: any, array: any) => {
          let splitStmt = element.split(".");

          return validateFeature(model.selectedFeatures, splitStmt, 0);
        }
      );
    } else {
      return expression.statements.some(
        (element: any, index: any, array: any) => {
          let splitStmt = element.split(".");

          return validateFeature(model.selectedFeatures, splitStmt, 0);
        }
      );
    }
  }
};

const validateFeature = (
  featureArray: Array<fmc.ISelectedFeature>,
  expressionParts: Array<string>,
  step: number
): boolean => {
  const result = featureArray.find((element: fmc.ISelectedFeature) => {
    return element.reference.name == expressionParts[step];
  });

  if (!result) {
    return false;
  }

  if (expressionParts.length - 1 <= step) {
    return true;
  }

  return validateFeature(result.children, expressionParts, ++step);
};

describe("Test FMConfig v2", () => {
  test("validate expression", () => {
    let result = checkIfCruiseControlIsEnabled(fmConfig);
    console.log(result);
  });
});
