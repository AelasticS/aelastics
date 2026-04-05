
import * as t from "./types-meta.model";
import {
  ExprNode,
  Template,
} from "../jsx/element";

export const TypeNumber: Template<t.INumber> = (props) => {
  return new ExprNode(t.Number, props, undefined);
};

export const TypeString: Template<t.IString> = (props) => {
  return new ExprNode(t.String, props, undefined);
};

export const TypeBoolean: Template<t.IBoolean> = (props) => {
  return new ExprNode(t.Boolean, props, undefined);
};
