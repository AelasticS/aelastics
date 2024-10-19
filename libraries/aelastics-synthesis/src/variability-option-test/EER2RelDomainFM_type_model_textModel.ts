import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
export const EER2RelDomainFM_type_model_Schema = t.schema("EER2RelDomainFM_type_model_Schema");
export const EER2RelDomainFM_type_model_Model = t.subtype(Model, {}, "EER2RelDomainFM_type_model_Model", EER2RelDomainFM_type_model_Schema);

export const Domain_FM_type = t.subtype(ModelElement,
    {
        Infrastructure_prop_prop: t.optional(t.link(EER2RelDomainFM_type_model_Schema, 'Infrastructure_type')),
        name: t.string
    },
    "Domain_FM_type", EER2RelDomainFM_type_model_Schema);

export const Entity_FM_type = t.subtype(ModelElement,
    {
        Infrastructure_prop_prop: t.optional(t.link(EER2RelDomainFM_type_model_Schema, 'Infrastructure_type')),
        name: t.string
    },
    "Entity_FM_type", EER2RelDomainFM_type_model_Schema);

export const Attribute_FM_type = t.subtype(ModelElement,
    {
        Infrastructure_prop_prop: t.optional(t.link(EER2RelDomainFM_type_model_Schema, 'Infrastructure_type')),
        name: t.string
    },
    "Attribute_FM_type", EER2RelDomainFM_type_model_Schema);

export const Relationship_FM_type = t.object(
    {
        numberOfInstances: t.number
    },
    "Relationship_FM_type", EER2RelDomainFM_type_model_Schema);


// export const UnionType = t.taggedUnion([Domain_FM_type, Entity_FM_type, Attribute_FM_type, Relationship_FM_type], "UnionType", EER2RelDomainFM_type_model_Schema);

const exclusiveGroup = t.taggedUnion(
    {
        Standard: t.object({
            attr: t.string,
            attr2: t.number
        }, "Standard", EER2RelDomainFM_type_model_Schema),
        Adaptive: t.arrayOf(
            t.object({}, "Adaptive", EER2RelDomainFM_type_model_Schema)
        ),
        TreciTip: t.link(EER2RelDomainFM_type_model_Schema, 'Relationship_FM_type'),
        NoviTip: Relationship_FM_type
    },
    "desc",
    "exclusiveGroup"
);



type exclusiveGroupType = t.TypeOf<typeof exclusiveGroup>;

let a: exclusiveGroupType = {numberOfInstances: 2};



// Exports type
export type IDomain_FM_type = t.TypeOf<typeof Domain_FM_type>;
export type IEntity_FM_type = t.TypeOf<typeof Entity_FM_type>;
export type IAttribute_FM_type = t.TypeOf<typeof Attribute_FM_type>;
export type IRelationship_FM_type = t.TypeOf<typeof Relationship_FM_type>;

export type elementConfigurationUnion = IDomain_FM_type | IEntity_FM_type | IAttribute_FM_type | IRelationship_FM_type;

export type elementConfiguraionSchema = { [key: string]: elementConfigurationUnion };
