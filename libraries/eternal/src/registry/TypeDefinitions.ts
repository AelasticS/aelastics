import { StoreClass } from "../store/StoreClass"


/** Property types for inverse relationship metadata */
//export type SimplePropType = 'string' | 'number' | 'boolean' | 'date';
// export type ComplexPropType = 'object' | 'array' | 'map' | 'set';
export type TypeKind = SimpleTypeKind | ComplexTypeKind

/** Simple type kinds */
export type SimpleTypeKind =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "literal"
  | "null"
  | "undefined"
  | "void"
  | "bigint"
  | "symbol"
  | "unknown"
  | "any"
  | "never"

/** Complex type kinds */
export type ComplexTypeKind =
  | "object"
  | "entity"
  | "array"
  | "map"
  | "set"
  | "union"
  | "intersection"
  | "tuple"
  | "taggedUnion"
  | "function"
  | "subtype"
  | "record"
  | "objectRef" // Special kind for object references

/** Base type metadata - common to all types */
export interface BaseTypeMeta {
  qName: string // Qualified name of the type
  label?: string // Human-readable label
  kind: TypeKind // Type kind (simple, complex, special)
}

/** Simple type metadata */
export interface SimpleTypeMeta extends BaseTypeMeta {
  kind: SimpleTypeKind
  literalValue?: any // For literal types only
}

/** Object/Entity type metadata */
export interface ObjectTypeMeta extends BaseTypeMeta {
  kind: "object" | "entity"
  properties: Map<string, PropertyMeta>
  identityKeys?: string[] // For entity types only
  extends?: string // Qualified name of base type
  roles?: string[] // List of allowed role names for this type

  // Bidirectional relationships (from aelastic-types)
  // inverse collection is possible only when target Type is an object
  // this is a constraint to be checked during import.
  inverseCollection?: Map<
    string,
    {
      propName: string
      targetTypeQName: string
      isCollection: boolean // true if inverse is array/set/map
    }
  >
}

/** Array<E> type metadata */
export interface ArrayTypeMeta extends BaseTypeMeta {
  kind: "array"
  elementType: string // Qualified name of element type
  minElements?: number
  maxElements?: number
}

/** Map<K,V> type metadata */
export interface MapTypeMeta extends BaseTypeMeta {
  kind: "map"
  keyType: string // Qualified name of key type
  valueType: string // Qualified name of value type
}

/** Set<V> type metadata */
export interface SetTypeMeta extends BaseTypeMeta {
  kind: "set"
  elementType: string // Qualified name of element type
}

/** Record<K,V> type metadata */
export interface RecordTypeMeta extends BaseTypeMeta {
  kind: "record"
  keyType: string // Qualified name of key type
  valueType: string // Qualified name of value type
}
/** Union type metadata */
export interface UnionTypeMeta extends BaseTypeMeta {
  kind: "union"
  memberTypes: string[] // Qualified names of union member types
}

/** Tagged union type metadata */
export interface TaggedUnionTypeMeta extends BaseTypeMeta {
  kind: "taggedUnion"
  discriminator: string // Property name used for discrimination
  memberTypes: Map<string, string> // discriminator value -> qualified type name
}

/** Intersection type metadata */
export interface IntersectionTypeMeta extends BaseTypeMeta {
  kind: "intersection"
  memberTypes: string[] // Qualified names of intersection member types
}

/** Tuple type metadata */
export interface TupleTypeMeta extends BaseTypeMeta {
  kind: "tuple"
  elementTypes: string[] // Qualified names of types for each position
}

/** Function type metadata */
export interface FunctionTypeMeta extends BaseTypeMeta {
  kind: "function"
  paramTypes: string[] // Qualified names of parameter types
  returnType: string // Qualified name of return type
}

/** Subtype metadata */
export interface SubtypeTypeMeta extends BaseTypeMeta {
  kind: "subtype"
  baseType: string // Qualified name of base type
  extraProperties: Map<string, PropertyMeta> // Additional properties
}

/** Object reference type metadata */
export interface ObjectRefTypeMeta extends BaseTypeMeta {
  kind: "objectRef"
  targetType: string // Qualified name of referenced entity type
}

/** Role metadata - describes roles that types can have */
export interface RoleMeta {
  qName: string // Qualified name of the role
  label?: string // Human-readable label for the role
  type: string // Type defining the role's structure
  isMandatory?: boolean // If true, the role must always exist
  isIndependent?: boolean // If true, the role can exist without the object
}

/** Union of all type metadata */
export type TypeMeta =
  | SimpleTypeMeta
  | ObjectTypeMeta
  | ArrayTypeMeta
  | MapTypeMeta
  | SetTypeMeta
  | RecordTypeMeta
  | UnionTypeMeta
  | TaggedUnionTypeMeta
  | IntersectionTypeMeta
  | TupleTypeMeta
  | FunctionTypeMeta
  | SubtypeTypeMeta
  | ObjectRefTypeMeta

/** Property metadata - describes properties of object/entity types */
export interface PropertyMeta {
  name: string // Property name
  typeRef: string // Qualified name of the property's type
  label?: string // Human-readable label
  optional: boolean // Whether property is optional (optimized from OptionalTypeMeta)
  defaultValue?: any // Default value

  // Bidirectional relationship metadata
  inverseProp?: string // Name of inverse property
  inverseTypeRef?: string // Qualified name of type containing inverse property
  inverseType?: TypeMeta // Data type of the inverse property (derived during import)
}

// Polymorphic functions for collection types

/** Get item type reference from collection TypeMeta */
export function getItemType(typeMeta: ArrayTypeMeta): string
export function getItemType(typeMeta: SetTypeMeta): string
export function getItemType(typeMeta: MapTypeMeta): string // returns valueType
export function getItemType(typeMeta: TypeMeta): string | undefined
export function getItemType(typeMeta: TypeMeta): string | undefined {
  switch (typeMeta.kind) {
    case "array":
      return (typeMeta as ArrayTypeMeta).elementType
    case "set":
      return (typeMeta as SetTypeMeta).elementType
    case "map":
      return (typeMeta as MapTypeMeta).valueType
    default:
      return undefined
  }
}

/** Get key type reference from map TypeMeta */
export function getKeyType(typeMeta: MapTypeMeta): string
export function getKeyType(typeMeta: TypeMeta): string | undefined
export function getKeyType(typeMeta: TypeMeta): string | undefined {
  if (typeMeta.kind === "map") {
    return (typeMeta as MapTypeMeta).keyType
  }
  return undefined
}

/** Get item type kind from PropertyMeta by resolving through registry */
export function getPropertyItemTypeKind(propMeta: PropertyMeta, store: StoreClass): TypeKind | undefined {
  const typeMeta = store.getTypeMeta(propMeta.typeRef)
  if (!typeMeta) return undefined

  const itemTypeRef = getItemType(typeMeta)
  if (!itemTypeRef) return undefined

  const itemTypeMeta = store.getTypeMeta(itemTypeRef)
  return itemTypeMeta?.kind
}

/** Get key type kind from PropertyMeta by resolving through registry (for maps) */
export function getPropertyKeyTypeKind(propMeta: PropertyMeta, store: StoreClass): TypeKind | undefined {
  const typeMeta = store.getTypeMeta(propMeta.typeRef)
  if (!typeMeta) return undefined

  const keyTypeRef = getKeyType(typeMeta)
  if (!keyTypeRef) return undefined

  const keyTypeMeta = store.getTypeMeta(keyTypeRef)
  return keyTypeMeta?.kind
}

/** Type checking functions */
export function isSimpleType(type: TypeMeta): type is SimpleTypeMeta {
  if (!type) return false
  const simpleKinds: SimpleTypeKind[] = ["string", "number", "boolean", "date", "literal", "null", "undefined", "void", "bigint", "symbol", "unknown", "any", "never"]
  return simpleKinds.includes(type.kind as SimpleTypeKind)
}

export function isComplexType(
  type: TypeMeta
): type is
  | ObjectTypeMeta
  | ArrayTypeMeta
  | MapTypeMeta
  | SetTypeMeta
  | RecordTypeMeta
  | UnionTypeMeta
  | TaggedUnionTypeMeta
  | IntersectionTypeMeta
  | TupleTypeMeta
  | FunctionTypeMeta
  | SubtypeTypeMeta {
  if (!type) return false
  const complexKinds: ComplexTypeKind[] = ["object", "entity", "array", "map", "set", "union", "intersection", "tuple", "taggedUnion", "function", "subtype", "record"]
  return complexKinds.includes(type.kind as ComplexTypeKind)
}

export function isObjectType(type: TypeMeta): type is ObjectTypeMeta {
  return type && (type.kind === "object" || type.kind === "entity")
}

export function isEntityType(type: TypeMeta): type is ObjectTypeMeta {
  return type && type.kind === "entity"
}

export function isCollectionType(type: TypeMeta): type is ArrayTypeMeta | MapTypeMeta | SetTypeMeta | RecordTypeMeta {
  return (
    type &&
    (type.kind === "array" || type.kind === "map" || type.kind === "set" || type.kind === "record")
  )
}
