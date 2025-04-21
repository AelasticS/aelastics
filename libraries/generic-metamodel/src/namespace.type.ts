import * as t from "aelastics-types"
import * as meta from "./types-meta.model"

export const NamespaceDefSchema = t.schema("NamespaceDefSchema");

export const NamespaceRelationship = t.object({
    object: meta.Object, // which object is in this namespace
    propName: t.string // which collection property of namespace is used to store namespace element (instance of object from previous line)
}, 'NamespaceRelationship', NamespaceDefSchema);

// todo add support for namespace hierarchy
// todo add support for derriving (defining) values properties of RepositoryObject and ModelElement
export const NamespaceDef = t.entity({
    namespace: meta.Object, // which object is namespace
    nameProp: t.string, // which property of namespace object corresponds to namespace name
    NSRelatioships: t.arrayOf(NamespaceRelationship), // which objects can be in this namespace
}, ['id'] as const, 'NamespaceDef', NamespaceDefSchema);

//
export const ModelDef = t.subtype(NamespaceDef, {

}, "ModelDef", NamespaceDefSchema);

export const ImportedModel = t.object({
    modelDef: ModelDef,
    allowedTypes: t.arrayOf(meta.Object)
}, 'ImprtedModel', NamespaceDefSchema);

export const NamespaceDefinitionsContainer = t.object({
    schema: meta.TypeModel,
    namespaces: t.arrayOf(NamespaceDef),
    models: t.arrayOf(ModelDef),
    exports: t.arrayOf(meta.Object),// objects that can be exported and imported from this schema (model)
    imports: t.arrayOf(ImportedModel) // models that are imported in this model

}, 'Definitions', NamespaceDefSchema);


export type INamespaceDef = t.TypeOf<typeof NamespaceDef>;
export type IModelDef = t.TypeOf<typeof ModelDef>;
export type INamespaceRelationship = t.TypeOf<typeof NamespaceRelationship>;
export type IDefinitions = t.TypeOf<typeof NamespaceDefinitionsContainer>;

// ovi tipovi su potrebni da bi se referencirali definisani tipovi u drugim (meta)modelima ()

export type INamespaceDefCode = { namespace: t.ObjectType<any, any>, NSRelationships: Array<INamespaceRelationshipCode>, nameProp: string };
export type INamespaceRelationshipCode = { object: t.ObjectType<any, any>, propName: string };
export type IModelDefCode = INamespaceDefCode;
export type IDefinitionsCode = {
    schema: t.TypeSchema,
    namespaces: Array<INamespaceDefCode>,
    models: Array<IModelDefCode>,
    exports: Array<t.ObjectType<any, any>>
}

function toIObject<T extends t.ObjectType<any, any>>(value: T): meta.IObject {
    return value as unknown as meta.IObject;
}

function toITypeModel<T extends t.TypeSchema>(value: T): meta.ITypeModel {
    return value as unknown as meta.ITypeModel;
}

function toIObjectCode<T extends meta.IObject>(value: T): t.ObjectType<any, any> {
    return value as unknown as t.ObjectType<any, any>;
}

function toITypeModelCode<T extends meta.ITypeModel>(value: T): t.TypeSchema {
    return value as unknown as t.TypeSchema;
}