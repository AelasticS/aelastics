/** Defines allowed property types */
export type ComplexPropType = 'object' | 'array' | 'map' | 'set';
export type PropertyType = 'string' | 'number' | 'boolean' | ComplexPropType;

/** Metadata for an individual property */
export interface PropertyMeta {
    name: string; // Property name
    optional?: boolean; // Whether the property is optional,
    type: PropertyType; // Data type of the property
    inverseType?: string; // Name of the inverse type (if bidirectional)
    inverseProp?: string; // Name of the inverse property (if bidirectional)
}

/** Metadata for an object type, defining its properties */
export interface TypeMeta {
    name: string; // Name of the object type
    properties: Map<string, PropertyMeta>; // Property name -> PropertyMeta mapping
    extends?: string; // Name of the base class (if sub classing is used)
}

/** Schema containing multiple type definitions */
export interface TypeSchema {
    name: string; // Schema name
    types: Map<string, TypeMeta>; // Type name -> TypeMeta mapping
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
