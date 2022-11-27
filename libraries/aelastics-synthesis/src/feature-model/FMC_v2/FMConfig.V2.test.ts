/**
 *
 */

import * as fmc from "./fm-configuration-meta.mode.V2";
import * as fm from "./../FM_v2/fm_v2.test";

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

let cruiseControl: fmc.ISolitaryFeature = {
  children: [],
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

// const exp = {
//   operation: "and",
//   statements: [
//     {
//       Wiper: {
//         Adaptive: {
//           RainControl: true,
//         },
//       },
//     },
//     {
//       CruiseControle: {
//         Adaptive: {
//           Radar: true,
//         },
//       },
//     },
//   ],
// };

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
    let result = validateExpression(exp, fmConfig);
    console.log(result);
  });
});
