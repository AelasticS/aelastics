import { TypeMeta, TypeSchema, SchemaRegistry, PropertyMeta } from "../meta/InternalSchema";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RegistryInfo {
  url: string;
  name: string;
  description: string;
  version: string;
  created: Date;
  lastModified: Date;
}

export interface NamespaceDefinition {
  name: string;
  description?: string;
  types: { [typeName: string]: TypeMeta };
  version: string;
  dependencies?: string[];
}

export interface INamespace {
  readonly name: string;
  readonly description?: string;
  readonly version?: string;
  
  // Type access (read-only)
  getType(typeName: string): TypeMeta | undefined;
  hasType(typeName: string): boolean;
  listTypes(): string[];
  
  // Type introspection (what store needs for operations)
  getProperties(typeName: string): Map<string, PropertyMeta>;
  getClass(typeName: string): any;
  getInheritanceChain(typeName: string): string[];
  getAllSubtypes(typeName: string): string[];
  
  // Validation support
  validateType(typeName: string): ValidationResult;
  
  // Namespace metadata (read-only)
  export(): NamespaceDefinition;
}

export interface IRegistry {
  // Namespace access (read-only)
  getNamespace(name: string): INamespace | undefined;
  listNamespaces(): string[];
  hasNamespace(name: string): boolean;
  
  // Import/export operations (the only "write" operations)
  importNamespace(definition: NamespaceDefinition): ValidationResult;
  exportNamespace(name: string): NamespaceDefinition;
  
  // Validation support
  validateNamespace(definition: NamespaceDefinition): ValidationResult;
  validateTypeDefinition(typeDef: TypeMeta): ValidationResult;
  
  // Registry metadata (read-only)
  getInfo(): RegistryInfo;
}