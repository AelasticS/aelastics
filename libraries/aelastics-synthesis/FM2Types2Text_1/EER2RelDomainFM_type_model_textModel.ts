import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
export const EER2RelDomainFM_type_model_Schema = t.schema("EER2RelDomainFM_type_model_Schema");
export const EER2RelDomainFM_type_model_Model = t.subtype(Model, {}, "EER2RelDomainFM_type_model_Model", EER2RelDomainFM_type_model_Schema);

export const Domain_FM_type = t.subtype(ModelElement,
    {
        Infrastructure_prop_prop: t.link(EER2RelDomainFM_type_model_Schema, 'Infrastructure_type'),
    },
    "Domain_FM_type", EER2RelDomainFM_type_model_Schema);

export const Entity_FM_type = t.subtype(ModelElement,
    {
        Infrastructure_prop_prop: t.link(EER2RelDomainFM_type_model_Schema, 'Infrastructure_type'),
    },
    "Entity_FM_type", EER2RelDomainFM_type_model_Schema);

export const Attribute_FM_type = t.subtype(ModelElement,
    {
        Infrastructure_prop_prop: t.link(EER2RelDomainFM_type_model_Schema, 'Infrastructure_type'),
    },
    "Attribute_FM_type", EER2RelDomainFM_type_model_Schema);

export const Relationship_FM_type = t.subtype(ModelElement,
    {
        Infrastructure_prop_prop: t.link(EER2RelDomainFM_type_model_Schema, 'Infrastructure_type'),
    },
    "Relationship_FM_type", EER2RelDomainFM_type_model_Schema);

// Exports type
export type IDomain_FM_type = t.TypeOf<typeof Domain_FM_type>;
export type IEntity_FM_type = t.TypeOf<typeof Entity_FM_type>;
export type IAttribute_FM_type = t.TypeOf<typeof Attribute_FM_type>;
export type IRelationship_FM_type = t.TypeOf<typeof Relationship_FM_type>;
