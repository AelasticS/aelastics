import * as ns from "./namespace.type"
import * as meta from "./types-meta.model"


let ObjectNSDef: ns.INamespaceDefCode = {
    namespace: meta.Object,
    nameProp: "name",
    NSRelationships: [{ object: meta.Property, propName: "properties" }], 
    // what to do with property elements in Namespace type?
}

let ModelNSDef: ns.IModelDefCode = {
    namespace: meta.TypeModel,
    nameProp: "name",
    NSRelationships: [
        { object: meta.Type, propName: "types" },
    ]
};


let TypesMM_NSDefinitions: ns.IDefinitionsCode = {
    schema: meta.TypesMM_TypeSchema,
    namespaces: [ObjectNSDef, ModelNSDef],
    models: [ModelNSDef],
    exports: [meta.Object, meta.Subtype, meta.Union], // maybe Optional or Array should be here, but it more like property type than type
};




