import * as fm from "./fm-meta.model.type";
import { ModelStore } from '../../index';
import {
  CpxTemplate,
  ExprNode,
  Template,
  WithRefProps,
} from "../../jsx/element";

export type IModelProps = WithRefProps<fm.IFeatureDiagram> & {
  store?: ModelStore;
};

export const FeatureDiagram: CpxTemplate<IModelProps, fm.IFeatureDiagram> = (
  props
) => {
  return new ExprNode(fm.FeatureDiagram, props, undefined);
};

export const SolitaryFeature: Template<fm.ISolitaryFeature> = (props) => {
  return new ExprNode(fm.SolitaryFeature, props, "subfeatures");
};

export const RootFeature: Template<fm.ISolitaryFeature> = (props) => {
  return new ExprNode(fm.SolitaryFeature, props, "rootFeatures");
};

export const GroupFeature: Template<fm.IGroupFeature> = (props) => {
  return new ExprNode(fm.GroupFeature, props, "subfeatures");
};

export const Attribute: Template<fm.IAttribute> = (props) => {
  return new ExprNode(fm.Attribute, props, "attributes");
};
