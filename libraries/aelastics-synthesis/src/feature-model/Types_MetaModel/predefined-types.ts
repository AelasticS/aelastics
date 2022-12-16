
import * as t from "./types-meta.model";
import { ModelStore } from "../../jsx/ModelsStore";
import {
  CpxTemplate,
  Element,
  Template,
  WithRefProps,
} from "../../jsx/element";

// export type IModelProps = WithRefProps<t.ITypeModel> & {
//   store?: ModelStore;
// };

export const TypeNumber: Template<t.INumber> = (props) => {
  return new Element(t.Number, props, undefined);
};

export const TypeString: Template<t.IString> = (props) => {
  return new Element(t.String, props, undefined);
};

export const TypeBoolean: Template<t.IBoolean> = (props) => {
  return new Element(t.Boolean, props, undefined);
};
