import * as fm from "./fm-meta.model-V2.type";
import { ModelStore } from "../../jsx/ModelsStore";
import {
  CpxTemplate,
  Element,
  Template,
  WithRefProps,
} from "../../jsx/element";

export type IModelProps = WithRefProps<fm.IFeatureDiagram> & {
  store?: ModelStore;
};

export const FeatureDiagram: CpxTemplate<IModelProps, fm.IFeatureDiagram> = (
  props
) => {
  return new Element(fm.FeatureDiagram, props, undefined);
};

export const SolitaryFeature: Template<fm.ISolitaryFeature> = (props) => {
  return new Element(fm.SolitaryFeature, props, undefined);
};

export const GroupFeature: Template<fm.IGroupFeature> = (props) => {
  return new Element(fm.GroupFeature, props, undefined);
};

export const Attribute: Template<fm.IAttribute> = (props) => {
  return new Element(fm.Attribute, props, "attributes");
};
