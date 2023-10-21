import * as e from "./EER.meta.model.type";
import {
  CpxTemplate,
  Element,
  Template,
  WithRefProps,
} from "../../jsx/element";
import { ModelStore } from "../../index";

export type IModelProps = WithRefProps<e.IEERSchema> & { store?: ModelStore };

export const EERSchema: CpxTemplate<IModelProps, e.IEERSchema> = (props) => {
  return new Element(e.EERSchema, props, undefined);
};

export const Kernel: Template<e.IKernel> = (props) => {
  return new Element(
    e.Kernel,
    // { objectClassification: "Kernel", ...props },
    props,
    undefined
  );
};

export const Weak: Template<e.IWeak> = (props) => {
  return new Element(
    e.Weak,
    // { objectClassification: "Weak", ...props },
    props,
    undefined
  );
};

export const Attribute: Template<e.IAttribute> = (props) => {
  return new Element(e.Attribute, props, "attributes");
};

export const Domain: Template<e.IDomain> = (props) => {
  return new Element(e.Domain, props, "attrDomain");
};

export const Relationship: Template<e.IRelationship> = (props) => {
  return new Element(e.Relationship, props, undefined);
};

export const OrdinaryMapping: Template<e.IOrdinaryMapping> = (props) => {
  return new Element(e.OrdinaryMapping, props, "ordinaryMapping");
};

export const WeakMapping: Template<e.IWeakMapping> = (props) => {
  return new Element(e.WeakMapping, props, undefined);
};
