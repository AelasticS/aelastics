import * as e from "./EER.meta.model.type"
import {
  CpxTemplate,
  Element,
  Template,
  WithRefProps,
} from "../../jsx/element"
import { ModelStore } from "../../index"

export type IModelProps = WithRefProps<e.IEERSchema> & { store?: ModelStore };

export const EERSchema: CpxTemplate<IModelProps, e.IEERSchema> = (props) => {
  return new Element(e.EERSchema, props, undefined)
}

export const Kernel: Template<e.IKernel> = (props) => {
  return new Element(
    e.Kernel,
    // { objectClassification: "Kernel", ...props },
    props,
    undefined,
  )
}

export const ERConcept: Template<e.IERConcept> = (props) => {
  // If the props contain a $refByName, we assume it's a reference to an existing ERConcept
  // if (props.$refByName) {
  return new Element(e.ERConcept, props, "elements")
  // }
}

export const Weak: Template<e.IWeak> = (props) => {
  return new Element(
    e.Weak,
    // { objectClassification: "Weak", ...props },
    props,
    undefined,
  )
}

export const Attribute: Template<e.IAttribute> = (props) => {
  return new Element(e.Attribute, props, "attributes")
}

export const Domain: Template<e.IDomain> = (props) => {
  return new Element(e.Domain, props, "attrDomain")
}

export const Relationship: Template<e.IRelationship> = (props) => {
  return new Element(e.Relationship, props, undefined)
}

export const OrdinaryMapping: Template<e.IOrdinaryMapping> = (props) => {
  return new Element(e.OrdinaryMapping, props, "ordinaryMappings")
}

export const WeakMapping: Template<e.IWeakMapping> = (props) => {
  return new Element(e.WeakMapping, props, undefined)
}

export const Subtype: Template<e.ISubtype> = (props) => {
  return new Element(e.Subtype, props, undefined)
}

export const Specialization: Template<e.ISpecialization> = (props) => {
  return new Element(e.Specialization, props, "specializations")
}

export const SpecializationMapping: Template<e.ISpecializationMapping> = (props) => {
  return new Element(e.SpecializationMapping, props, "mapping")
}

export const Aggregation: Template<e.IAggregation> = (props) => {
  return new Element(e.Aggregation, props, undefined)
}

export const AggregationMapping: Template<e.IAggregationMapping> = (props) => {
  return new Element(e.AggregationMapping, props, "agrMapp")
}

export const Role: Template<e.IOrdinaryMapping> = (props) => {
  return new Element(e.OrdinaryMapping, props, "ordinaryMappings")
}

export const Entity: Template<e.IKernel> = (props) => {
  return new Element(e.Kernel, props, undefined)
}
