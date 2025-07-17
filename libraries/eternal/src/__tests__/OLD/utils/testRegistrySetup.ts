import { SimpleTypeMeta, ArrayTypeMeta, MapTypeMeta, SetTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { RegistryService } from "../../registry/RegistryService";

/**
 * Creates standard types namespace that should be imported by all test registries
 */
export function createStandardTypesNamespace(): Namespace {
  const stringType: SimpleTypeMeta = {
    qName: "/std/string",
    category: "simple",
    kind: "string"
  };

  const numberType: SimpleTypeMeta = {
    qName: "/std/number",
    category: "simple",
    kind: "number"
  };

  const booleanType: SimpleTypeMeta = {
    qName: "/std/boolean",
    category: "simple",
    kind: "boolean"
  };

  const dateType: SimpleTypeMeta = {
    qName: "/std/date",
    category: "simple",
    kind: "date"
  };

  // Array type is generic - this is the base definition
  const arrayType: ArrayTypeMeta = {
    qName: "/std/array",
    category: "complex",
    kind: "array",
    elementType: "T" // Generic placeholder
  };

  // Map type is generic - this is the base definition
  const mapType: MapTypeMeta = {
    qName: "/std/map",
    category: "complex",
    kind: "map",
    keyType: "K", // Generic placeholder
    valueType: "V" // Generic placeholder
  };

  // Set type is generic - this is the base definition
  const setType: SetTypeMeta = {
    qName: "/std/set",
    category: "complex",
    kind: "set",
    elementType: "T" // Generic placeholder
  };

  return {
    qName: "/std",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
      ["string", stringType],
      ["number", numberType],
      ["boolean", booleanType],
      ["date", dateType],
      ["array", arrayType],
      ["map", mapType],
      ["set", setType]
    ]),
    exports: ["string", "number", "boolean", "date", "array", "map", "set"],
    imports: new Map()
  };
}

/**
 * Creates a concrete array type for a specific element type
 */
export function createArrayType(elementType: string): ArrayTypeMeta {
  return {
    qName: `/std/array<${elementType}>`,
    category: "complex",
    kind: "array",
    elementType: elementType
  };
}

/**
 * Creates a concrete map type for specific key and value types
 */
export function createMapType(keyType: string, valueType: string): MapTypeMeta {
  return {
    qName: `/std/map<${keyType}, ${valueType}>`,
    category: "complex",
    kind: "map",
    keyType: keyType,
    valueType: valueType
  };
}

/**
 * Creates a concrete set type for a specific element type
 */
export function createSetType(elementType: string): SetTypeMeta {
  return {
    qName: `/std/set<${elementType}>`,
    category: "complex",
    kind: "set",
    elementType: elementType
  };
}

/**
 * Creates a test registry with standard types pre-loaded
 */
export function createTestRegistry(): RegistryService {
  const registryMetadata: RegistryMetadata = {
    namespaces: new Map(),
    name: "Test Registry",
    version: "1.0.0",
    created: new Date(),
    lastModified: new Date()
  };
  
  const registry = new RegistryService(registryMetadata);
  
  // Import standard types
  const stdNamespace = createStandardTypesNamespace();
  registry.importNamespace(stdNamespace);
  
  return registry;
}