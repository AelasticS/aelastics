import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel";

export const UMLSchema = t.schema("UMLSchema");

export const ClassDiagram = t.subtype(Model, {
}, "ClassDiagram", UMLSchema);

export const Classifier = t.subtype(ModelElement, {

}, "ClassDiagram", UMLSchema);

export const Property = t.subtype(ModelElement, {
    type: Classifier,
    multiplicity: t.optionalString,  // 1, *, 0..1, 
    visibility: t.optionalString // public, protected, private
}, "Property", UMLSchema);

export const DataType = t.subtype(Classifier, {
}, "DataType", UMLSchema);

export const Boolean = t.subtype(DataType, {
}, "Boolean", UMLSchema);
export const Integer = t.subtype(DataType, {
}, "Integer", UMLSchema);
export const String = t.subtype(DataType, {
}, "String", UMLSchema);

export const Class = t.subtype(Classifier, {
    subClasses:t.arrayOf(t.link(UMLSchema, "Class")),
    superClass: t.arrayOf(t.link(UMLSchema, "Class")),
    properties:t.arrayOf(Property),
}, "Class", UMLSchema);

export const Association = t.subtype(ModelElement, {
    from: Class,
    to: Class,
    navigability:t.optionalString, // unspecified, direct (from->to), inverse (to->from), both (from<->to)
    associationType: t.string // regular, aggregation, composition, dependency, realization
}, "Association", UMLSchema);



export type IClassDiagram = t.TypeOf<typeof ClassDiagram>
export type IClassifier = t.TypeOf<typeof Classifier>
export type IProperty = t.TypeOf<typeof Property>
export type IDataType = t.TypeOf<typeof DataType>
export type IBoolean = t.TypeOf<typeof Boolean>
export type IString = t.TypeOf<typeof String>
export type IInteger = t.TypeOf<typeof Integer>
export type IClass = t.TypeOf<typeof Class>
export type IAssociation = t.TypeOf<typeof Association>