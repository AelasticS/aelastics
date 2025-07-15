/** Type categories for the unified type system */
export type TypeCategory = 'simple' | 'complex' | 'special';

/** Simple type kinds */
export type SimpleTypeKind = 
    | 'string' 
    | 'number' 
    | 'boolean' 
    | 'date'
    | 'literal'
    | 'null'
    | 'undefined'
    | 'void';

/** Complex type kinds */
export type ComplexTypeKind = 
    | 'object'
    | 'entity'
    | 'array'
    | 'map'
    | 'set'
    | 'union'
    | 'intersection'
    | 'tuple'
    | 'taggedUnion'
    | 'function'
    | 'subtype';

/** Special type kinds for references */
export type SpecialTypeKind = 
    | 'objectRef';

/** Base type metadata - common to all types */
export interface BaseTypeMeta {
    qName: string; // Qualified name of the type
    label?: string; // Human-readable label
    category: TypeCategory;
}

/** Simple type metadata */
export interface SimpleTypeMeta extends BaseTypeMeta {
    category: 'simple';
    kind: SimpleTypeKind;
    literalValue?: any; // For literal types only
}

/** Object/Entity type metadata */
export interface ObjectTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'object' | 'entity';
    properties: Map<string, PropertyMeta>;
    identityKeys?: string[]; // For entity types only
    extends?: string; // Qualified name of base type
    
    // Bidirectional relationships (from aelastic-types)
    // inverse collection is possible only when target Type is an object
    // this is a constraint to be checked during import.
    inverseCollection?: Map<string, {
        propName: string;
        targetTypeQName: string;
        isCollection: boolean; // true if inverse is array/set/map
    }>;
}

/** Array type metadata */
export interface ArrayTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'array';
    elementType: string; // Qualified name of element type
    minElements?: number;
    maxElements?: number;
}

/** Map type metadata */
export interface MapTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'map';
    keyType: string; // Qualified name of key type
    valueType: string; // Qualified name of value type
}

/** Set type metadata */
export interface SetTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'set';
    elementType: string; // Qualified name of element type
}

/** Union type metadata */
export interface UnionTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'union';
    memberTypes: string[]; // Qualified names of union member types
}

/** Tagged union type metadata */
export interface TaggedUnionTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'taggedUnion';
    discriminator: string; // Property name used for discrimination
    memberTypes: Map<string, string>; // discriminator value -> qualified type name
}

/** Intersection type metadata */
export interface IntersectionTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'intersection';
    memberTypes: string[]; // Qualified names of intersection member types
}

/** Tuple type metadata */
export interface TupleTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'tuple';
    elementTypes: string[]; // Qualified names of types for each position
}

/** Function type metadata */
export interface FunctionTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'function';
    paramTypes: string[]; // Qualified names of parameter types
    returnType: string; // Qualified name of return type
}

/** Subtype metadata */
export interface SubtypeTypeMeta extends BaseTypeMeta {
    category: 'complex';
    kind: 'subtype';
    baseType: string; // Qualified name of base type
    extraProperties: Map<string, PropertyMeta>; // Additional properties
}

/** Object reference type metadata */
export interface ObjectRefTypeMeta extends BaseTypeMeta {
    category: 'special';
    kind: 'objectRef';
    targetType: string; // Qualified name of referenced entity type
}

/** Union of all type metadata */
export type TypeMeta = 
    | SimpleTypeMeta
    | ObjectTypeMeta
    | ArrayTypeMeta
    | MapTypeMeta
    | SetTypeMeta
    | UnionTypeMeta
    | TaggedUnionTypeMeta
    | IntersectionTypeMeta
    | TupleTypeMeta
    | FunctionTypeMeta
    | SubtypeTypeMeta
    | ObjectRefTypeMeta;

/** Property metadata - describes properties of object/entity types */
export interface PropertyMeta {
    name: string; // Property name
    typeRef: string; // Qualified name of the property's type
    label?: string; // Human-readable label
    optional: boolean; // Whether property is optional (optimized from OptionalTypeMeta)
    defaultValue?: any; // Default value
    
    // Bidirectional relationship metadata
    inverseProp?: string; // Name of inverse property
    inverseTypeRef?: string; // Qualified name of type containing inverse property
}

/** Type checking functions */
export function isSimpleType(type: TypeMeta): type is SimpleTypeMeta {
    return type.category === 'simple';
}

export function isComplexType(type: TypeMeta): type is ObjectTypeMeta | ArrayTypeMeta | MapTypeMeta | SetTypeMeta | UnionTypeMeta | TaggedUnionTypeMeta | IntersectionTypeMeta | TupleTypeMeta | FunctionTypeMeta | SubtypeTypeMeta {
    return type.category === 'complex';
}

export function isSpecialType(type: TypeMeta): type is ObjectRefTypeMeta {
    return type.category === 'special';
}

export function isObjectType(type: TypeMeta): type is ObjectTypeMeta {
    return type.category === 'complex' && (type.kind === 'object' || type.kind === 'entity');
}

export function isEntityType(type: TypeMeta): type is ObjectTypeMeta {
    return type.category === 'complex' && type.kind === 'entity';
}

export function isCollectionType(type: TypeMeta): type is ArrayTypeMeta | MapTypeMeta | SetTypeMeta {
    return type.category === 'complex' && (type.kind === 'array' || type.kind === 'map' || type.kind === 'set');
}