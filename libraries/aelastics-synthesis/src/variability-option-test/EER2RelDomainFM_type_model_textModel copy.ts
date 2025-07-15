import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
export const EER2RelDomainFM_type_model_Schema = t.schema("EER2RelDomainFM_type_model_Schema");
export const EER2RelDomainFM_type_model_Model = t.subtype(Model, {}, "EER2RelDomainFM_type_model_Model", EER2RelDomainFM_type_model_Schema);

export const Performance_type = t.object(
    {
        WhatIsMoreImportant_desc: t.literal("Performance_type"),
    },
    "Performance_type", EER2RelDomainFM_type_model_Schema);

export const Flexibility_type = t.object(
    {
        WhatIsMoreImportant_desc: t.literal("Flexibility_type"),
    },
    "Flexibility_type", EER2RelDomainFM_type_model_Schema);

export const OptionalPerformance_type = t.optional(Performance_type, "OptionalPerformance_type", EER2RelDomainFM_type_model_Schema);


export const WhatIsMoreImportant_union = t.taggedUnion(
    {
        Performance_optional: OptionalPerformance_type,
        Flexibility_optional: t.optional(Flexibility_type),
        ArrayWithConstraint: t.arrayOf(t.object({ name: t.string }), 'ArrayWithConstraint', EER2RelDomainFM_type_model_Schema).addValidator({
            message: (value, label) => `Expected ${label} to be after 2000,got ${value}`,
            predicate: value => value.length > 1 && value.length < 6
        }),
    }, 'WhatIsMoreImportant_desc',

    "WhatIsMoreImportant_union", EER2RelDomainFM_type_model_Schema);

// Exports type
export type IPerformance_type = t.TypeOf<typeof Performance_type>;
export type IFlexibility_type = t.TypeOf<typeof Flexibility_type>;
export type IWhatIsMoreImportant_union = t.TypeOf<typeof WhatIsMoreImportant_union>;
