/** Defines allowed property types */
export type ComplexPropType = 'object' | 'array' | 'map' | 'set';

/**
 * Function to check if a value belongs to ComplexPropType
 */
export function isComplexValueType(value: any): value is ComplexPropType {
    return ['object', 'array', 'map', 'set', 'union', 'intersection'].includes(value);
}

export function isSimpleValueType(value: any): value is ComplexPropType {
    return ['string', 'number', 'boolean', 'date'].includes(value);
}
export type ValueType = 'string' | 'number' | 'boolean' | ComplexPropType;

/** Metadata for an individual property */
export interface PropertyMeta {
    qName: string; // Property name
    label?: string; // Human-readable label for the property
    optional?: boolean; // Whether the property is optional
    type: ValueType; // Value type of the property
    domainType?: string; // Name of the object type
    itemType?: ValueType; // value type of the items (if array, map, or set)
    keyType?: ValueType; // value type of the keys (if map)
    inverseType?: string; // Name of the type 
    inverseProp?: string; // Name of the inverse property (if bidirectional)
    minElements?: number; // Minimum elements for collection properties
    maxElements?: number; // Maximum elements for collection properties
    defaultValue?: any; // Default value for simple properties
}

interface ObjectProp {
    domainType: string; // Name of the object type
    inverseProp?: string; // Name of the inverse property (if bidirectional)
}

interface ArrayProp {
    itemValue: ValueType; // value type of the items: string,number,... object, array, map, set)
    domainType?: string; // Name of the object type
    minElements?: number;
    maxElements?: number;
}
interface MapProp {
    name: string;
    type: string;
    inverseType?: string;
    inverseProp?: string;
    minElements?: number;
    maxElements?: number;
}

interface SetProp {
    name: string;
    type: string;
    inverseType?: string;
    inverseProp?: string;
    minElements?: number;
    maxElements?: number;
}


export interface RootTypeMeta { 
    qName: string; // Name of the object type
    label?: string; // Human-readable label for the type
    basicType:ValueType
}

/** Metadata for an object type, defining its properties */
export interface ObjectTypeMeta extends RootTypeMeta {  
    properties: Map<string, PropertyMeta>; // Property name -> PropertyMeta mapping
    extends?: string; // Name of the base class (if subclassing is used)
    roles?: string[]; // List of allowed role names for this type
}

/** Metadata for a role */
export interface RoleMeta extends RootTypeMeta {
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
    types: Map<string, ObjectTypeMeta>; // Type name -> TypeMeta mapping
    roles?: Map<string, RoleMeta>; // Role name -> RoleMeta mapping
    export?: string[]; // List of exported types and roles
    import?: Map<string, string[]>; // Imported schemas and their selected types/roles (supports aliasing)
    resolvedTypes?:Map<string, ObjectTypeMeta> // resolved types
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
export function getPropertyType(schema: TypeSchema, typeName: string, propName: string): ValueType | undefined {
    const typeMeta = schema.types.get(typeName);
    if (!typeMeta) {
        return undefined;
    }
    const propMeta = typeMeta.properties.get(propName);
    return propMeta?.type;
}

// extract local name from fully qualified name
export const localName = (fqName:string) => fqName.split('/').pop();