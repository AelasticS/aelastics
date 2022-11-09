import * as t from "aelastics-types"
import {Model, ModelElement } from "generic-metamodel";

export const TrSchema = t.schema("TrSchema");

// meta level
export const M2M_Transformation = t.subtype(Model, {
    from: t.string, // source metamodel full name (path)
    to: t.string    // destination metamodel full name (path)
}, "M2M_Transformation", TrSchema);

export const E2E_Transformation = t.subtype(ModelElement, {
    fromType: t.string, // source metamodel element full name (path)
    toType: t.string    // destination metamodel element full name (path)
}, "E2E_Transformation", TrSchema);

// instance level
export const M2M_Trace = t.subtype(Model, {
    from: t.entityRef(Model),   // source model ID
    to: t.entityRef(Model),     // destination model ID
    instanceOf:M2M_Transformation
}, "M2M_Trace", TrSchema);

export const E2E_Trace = t.subtype(ModelElement, {
    from: t.arrayOf(t.entityRef(ModelElement)),  // identifires of source model elements
    to: t.arrayOf(t.entityRef(ModelElement)), // // identifires of destination model elements
    instanceOf:E2E_Transformation
}, "E2E_Trace", TrSchema);


export type IM2M_Transformation = t.TypeOf<typeof M2M_Transformation>
export type IE2E_Transformation = t.TypeOf<typeof E2E_Transformation>
export type IM2M_Trace = t.TypeOf<typeof M2M_Trace>
export type IE2E_Trace = t.TypeOf<typeof E2E_Trace>
