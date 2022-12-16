/** @jsx hm */

import { hm } from "../../jsx/handle";

import * as t from "./types-meta.model";
import { ModelStore } from "../../jsx/ModelsStore";
import { Element } from "../../jsx/element";
import { TypeModel } from "./types-components";
import { TypeBoolean, TypeNumber, TypeString } from "./predefined-types";

export const importPredefinedTypes = (modelId: string) => {
  let a = (
    <TypeModel $ref_local_id={modelId}>
      <TypeNumber name="number" $local_id="number"></TypeNumber>
      <TypeString name="string" $local_id="string"></TypeString>
      <TypeBoolean name="boolean" $local_id="boolean"></TypeBoolean>
    </TypeModel>
  );

  return a;
};
