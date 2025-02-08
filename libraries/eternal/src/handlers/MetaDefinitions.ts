/** Defines allowed property types */
export type PropertyType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'map' | 'set';

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
    extends?: string; // Name of the base class (if subclassing is used)
}

/** Schema containing multiple type definitions */
export interface TypeSchema {
    name: string; // Schema name
    types: Map<string, TypeMeta>; // Type name -> TypeMeta mapping
}
