import { PropertyType } from "./PropertyDefinitions";


/** Metadata for an individual property */
export interface PropertyMeta {
    qName: string; // Property name
    label?: string; // Human-readable label for the property
    optional?: boolean; // Whether the property is optional
    type: PropertyType; // Data type of the property
    itemType?: PropertyType; // Data type of the items (if array, map, or set): simplePropType or ComplexPropType
    keyType?: PropertyType; // Data type of the keys (if map)
    domainType?: string; // Name of the property domain of
    minElements?: string; // Minimum elements for collection properties // TODO add collection of constrains as (self)=>boolean
    maxElements?: string; // Maximum elements for collection properties
    defaultValue?: any; // Default value for simple properties
    inverseProp?: string; // Name of the inverse property (if bidirectional)
    inverseType?: PropertyType; // Data type of the inverse property
}

export function isCollectionOfReferences(p: PropertyMeta): boolean {
    return (p.type === "array" || p.type === "map" || p.type === "set") && p.itemType === "object";
}
export function isReference(p: PropertyMeta): boolean {    
    return (p.type === "object")
}

/** Metadata for an object type, defining its properties */
export interface TypeMeta {
    qName: string; // Name of the object type
    label?: string; // Human-readable label for the type
    properties: Map<string, PropertyMeta>; // Property name -> PropertyMeta mapping
    extends?: string; // Name of the base class (if subclass-ing is used)
    roles?: string[]; // List of allowed role names for this type
}

/** Metadata for a role */
export interface RoleMeta {
    qName: string; // Name of the role
    label?: string; // Human-readable label for the role
    type: string; // Type defining the role’s structure
    isMandatory?: boolean; // If true, the role must always exist
    isIndependent?: boolean; // If true, the role can exist without the object
 //   isVersionable?: boolean; // If true, the role has its own versioning history
}

/** Schema containing multiple type and role definitions */
export interface TypeSchema {
    qName: string; // Schema name
    label?: string; // Human-readable label for the schema
    version?: string; // Schema version
    parentSchema?: string; // Full path of the parent schema
    types: Map<string, TypeMeta>; // Type name -> TypeMeta mapping
    roles?: Map<string, RoleMeta>; // Role name -> RoleMeta mapping
    export?: string[]; // List of exported types and roles
    import?: Map<string, string[]>; // Imported schemas and their selected types/roles (supports aliasing)
    resolvedTypes?:Map<string, TypeMeta> // resolved types
}

/** Registry of schemas */
export interface SchemaRegistry {
    schemas: Map<string, TypeSchema>; // Mapping of schema full-path-names to schemas
}

/**
 * Function to get the type of a property for a given type
 * @param schema - The schema containing type definitions
 * @param typeName - The name of the type
 * @param propName - The name of the property
 * @returns The type of the property or undefined if not found
 */
export function getPropertyType(schema: TypeSchema, typeName: string, propName: string): PropertyType | undefined {
    const typeMeta = schema.types.get(typeName);
    if (!typeMeta) {
        return undefined;
    }
    const propMeta = typeMeta.properties.get(propName);
    return propMeta?.type;
}

// extract local name from fully qualified name
export const localName = (fqName:string) => fqName.split('/').pop();