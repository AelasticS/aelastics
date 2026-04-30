import * as e from "./EER.meta.model.type"
import {
  CpxTemplate,
  ExprNode,
  Template,
  WithRefProps,
} from "../../jsx/element"
import { ModelStore } from "../../index"

export type IModelProps = WithRefProps<e.IEERSchema> & { store?: ModelStore };

export const EERSchema: CpxTemplate<IModelProps, e.IEERSchema> = (props) => {
  return new ExprNode(e.EERSchema, props, undefined)
}

export const Kernel: Template<e.IKernel> = (props) => {
  return new ExprNode(
    e.Kernel,
    // { objectClassification: "Kernel", ...props },
    props,
    undefined,
  )
}

export const ERConcept: Template<e.IERConcept> = (props) => {
  // If the props contain a $refByName, we assume it's a reference to an existing ERConcept
  // if (props.$refByName) {
  return new ExprNode(e.ERConcept, props, "elements")
  // }
}

export const Weak: Template<e.IWeak> = (props) => {
  return new ExprNode(
    e.Weak,
    // { objectClassification: "Weak", ...props },
    props,
    undefined,
  )
}

export const Attribute: Template<e.IAttribute> = (props) => {
  return new ExprNode(e.Attribute, props, "attributes")
}

export const Domain: Template<e.IDomain> = (props) => {
  return new ExprNode(e.Domain, props, "attrDomain")
}

export const Relationship: Template<e.IRelationship> = (props) => {
  return new ExprNode(e.Relationship, props, undefined)
}

export const OrdinaryMapping: Template<e.IOrdinaryMapping> = (props) => {
  return new ExprNode(e.OrdinaryMapping, props, "roles")
}

export const WeakMapping: Template<e.IWeakMapping> = (props) => {
  return new ExprNode(e.WeakMapping, props, undefined)
}

export const Subtype: Template<e.ISubtype> = (props) => {
  return new ExprNode(e.Subtype, props, undefined)
}

export const Specialization: Template<e.ISpecialization> = (props) => {
  return new ExprNode(e.Specialization, props, "specializations")
}

export const SpecializationMapping: Template<e.ISpecializationMapping> = (props) => {
  return new ExprNode(e.SpecializationMapping, props, "mapping")
}

export const Aggregation: Template<e.IAggregation> = (props) => {
  return new ExprNode(e.Aggregation, props, undefined)
}

export const AggregationMapping: Template<e.IAggregationMapping> = (props) => {
  return new ExprNode(e.AggregationMapping, props, "agrMapp")
}

export const Role: Template<e.IOrdinaryMapping> = (props) => {
  return new ExprNode(e.OrdinaryMapping, props, "roles")
}

export const Entity: Template<e.IKernel> = (props) => {
  return new ExprNode(e.Kernel, props, undefined)
}
