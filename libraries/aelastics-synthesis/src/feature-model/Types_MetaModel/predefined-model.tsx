/** @jsx hm */

import { hm } from "../../jsx/handle";

import { TypeModel } from "./types-components";
import { TypeBoolean, TypeNumber, TypeString } from "./predefined-types";

export const importPredefinedTypes = (modelName: string) => {
  let a = (
    <TypeModel $refByName={modelName}>
      <TypeNumber name="number" ></TypeNumber>
      <TypeString name="string"></TypeString>
      <TypeBoolean name="boolean"></TypeBoolean>
    </TypeModel>
  );

  return a;
};
