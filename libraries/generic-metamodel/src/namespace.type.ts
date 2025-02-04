import * as t from "aelastics-types"
import * as meta from "./types-meta.model"

export const NamespaceDefSchema = t.schema("NamespaceDefSchema");

export const NamespaceRelationship = t.object({
    object: meta.Object, // which object is in this namespace
    propName: t.string // which collection property of namespace is used to store namespace element (instance of object from previous line)
}, 'NamespaceRelationship', NamespaceDefSchema);

export const ModelRelationship = t.object({
    object: meta.Object, // which object is in this model
    propName: t.string // which collection property of model is used to store model element (instance of object from previous line)
}, "ModelRelationship", NamespaceDefSchema);

export const NamespaceDef = t.entity({
    namespace: meta.Object, // which object is namespace
    NSRelatioships: t.arrayOf(NamespaceRelationship), // which objects can be in this namespace
}, ['id'] as const, 'NamespaceDef', NamespaceDefSchema);

export const ModelDef = t.subtype(NamespaceDef, {
    MRelatioships: t.arrayOf(ModelRelationship), // which objects can be in this model
}, "ModelDef", NamespaceDefSchema);

export const Definitions = t.object({
    schema: meta.TypeModel,
    namespaces: t.arrayOf(NamespaceDef),
    models: t.arrayOf(ModelDef),
    exports: t.arrayOf(meta.Object) // objects that can be exported and imported from this schema (model)

}, 'Definitions', NamespaceDefSchema);


export type INamespaceDef = t.TypeOf<typeof NamespaceDef>;
export type IModelDef = t.TypeOf<typeof ModelDef>;
export type INamespaceRelationship = t.TypeOf<typeof NamespaceRelationship>;
export type IModelRelationship = t.TypeOf<typeof ModelRelationship>;
export type IDefinitions = t.TypeOf<typeof Definitions>;

export type INamespaceDefCode = { namespace: t.ObjectType<any, any>, NSRelationships: Array<INamespaceRelationshipCode> }
export type INamespaceRelationshipCode = { object: t.ObjectType<any, any>, propName: string };
export type IModelRelationshipCode = { object: t.ObjectType<any, any>, propName: string };
export type IModelDefCode = INamespaceDefCode & { MRelatioships: Array<IModelRelationshipCode> }
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