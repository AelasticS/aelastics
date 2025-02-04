import * as ns from "./namespace.type"
import * as meta from "./types-meta.model"


let ObjectNSDef: ns.INamespaceDefCode = {
    namespace: meta.Object,
    NSRelationships: [{ object: meta.Property, propName: "properties" }], 
    // what to do with property elements in Namespace type?
}

// potentially redundant with ObjectNSDef
let SubtypeNSDef: ns.INamespaceDefCode = {
    namespace: meta.Subtype,
    NSRelationships: [{ object: meta.Property, propName: "properties" }],
}

let ModelNSDef: ns.IModelDefCode = {
    namespace: meta.TypeModel,
    NSRelationships: [
        { object: meta.Type, propName: "types" },
    ],
    MRelatioships: [
        { object: meta.Type, propName: "modelElements" },
        { object: meta.Property, propName: "modelElements" },
    ],
};


let TypesMM_NSDefinitions: ns.IDefinitionsCode = {
    schema: meta.TypesMM_TypeSchema,
    namespaces: [ObjectNSDef, SubtypeNSDef],
    models: [ModelNSDef],
    exports: [meta.Object, meta.Subtype, meta.Union], // maybe Optional or Array should be here, but it more like property type than type
};




