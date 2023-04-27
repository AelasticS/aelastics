import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel";

export const Uml_Schema = t.schema("Uml_Schema");

export const UmlClassifier = t.subtype(ModelElement, {
}, "UmlClassifier", Uml_Schema);

export const UmlProperty = t.subtype(ModelElement, {
    type: UmlClassifier,
    multiplicity: t.string
}, "UmlProperty", Uml_Schema);

export const UmlDataType = t.subtype(UmlClassifier, {
}, "UmlDataType", Uml_Schema);

export const UmlClass = t.subtype(UmlClassifier, {
    properties:t.arrayOf(UmlProperty),
}, "UmlClass", Uml_Schema);

export const UmlAssociation = t.subtype(ModelElement, {
    from: UmlProperty,
    to: UmlProperty,
    navigability:t.string,
    associationType: t.string // regular, aggregation, composition, dependency, realization
}, "UmlAssociation", Uml_Schema);