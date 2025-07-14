import { IRegistry, INamespace, ValidationResult, RegistryInfo, NamespaceDefinition } from "../interfaces/IRegistry";
import { SchemaRegistry, TypeSchema, TypeMeta, PropertyMeta } from "../meta/InternalSchema";

export class NamespaceAdapter implements INamespace {
  constructor(private schema: TypeSchema, private registry: SchemaRegistry) {}

  get name(): string {
    return this.schema.qName;
  }

  get description(): string | undefined {
    return this.schema.label;
  }

  get version(): string | undefined {
    return this.schema.version;
  }

  getType(typeName: string): TypeMeta | undefined {
    return this.schema.resolvedTypes?.get(typeName) || this.schema.types.get(typeName);
  }

  hasType(typeName: string): boolean {
    return this.schema.types.has(typeName) || (this.schema.resolvedTypes?.has(typeName) ?? false);
  }

  listTypes(): string[] {
    const localTypes = Array.from(this.schema.types.keys());
    const resolvedTypes = this.schema.resolvedTypes ? Array.from(this.schema.resolvedTypes.keys()) : [];
    return [...new Set([...localTypes, ...resolvedTypes])];
  }

  getProperties(typeName: string): Map<string, PropertyMeta> {
    const type = this.getType(typeName);
    return type?.properties || new Map();
  }

  getClass(typeName: string): any {
    // Return the TypeMeta as the "class" representation
    return this.getType(typeName);
  }

  getInheritanceChain(typeName: string): string[] {
    const chain: string[] = [];
    let currentType = this.getType(typeName);
    
    while (currentType) {
      chain.push(currentType.qName);
      if (currentType.extends) {
        currentType = this.getType(currentType.extends);
      } else {
        break;
      }
    }
    
    return chain;
  }

  getAllSubtypes(typeName: string): string[] {
    const subtypes: string[] = [];
    
    for (const [typeQName, typeMeta] of this.schema.types) {
      if (typeMeta.extends === typeName) {
        subtypes.push(typeQName);
        // Recursively get subtypes of subtypes
        subtypes.push(...this.getAllSubtypes(typeQName));
      }
    }
    
    return subtypes;
  }

  validateType(typeName: string): ValidationResult {
    const type = this.getType(typeName);
    if (!type) {
      return { isValid: false, errors: [`Type ${typeName} not found`] };
    }
    
    // Basic validation - could be expanded
    return { isValid: true, errors: [] };
  }

  export(): NamespaceDefinition {
    const typesObject: { [typeName: string]: TypeMeta } = {};
    
    for (const [typeName, typeMeta] of this.schema.types) {
      typesObject[typeName] = typeMeta;
    }
    
    return {
      name: this.schema.qName,
      description: this.schema.label,
      types: typesObject,
      version: this.schema.version || "1.0.0",
      dependencies: this.schema.import ? Array.from(this.schema.import.keys()) : undefined
    };
  }
}

export class RegistryAdapter implements IRegistry {
  constructor(private schemaRegistry: SchemaRegistry) {}

  getNamespace(name: string): INamespace | undefined {
    const schema = this.schemaRegistry.schemas.get(name);
    return schema ? new NamespaceAdapter(schema, this.schemaRegistry) : undefined;
  }

  listNamespaces(): string[] {
    return Array.from(this.schemaRegistry.schemas.keys());
  }

  hasNamespace(name: string): boolean {
    return this.schemaRegistry.schemas.has(name);
  }

  importNamespace(definition: NamespaceDefinition): ValidationResult {
    // Convert NamespaceDefinition to TypeSchema format
    const schema: TypeSchema = {
      qName: definition.name,
      label: definition.description,
      version: definition.version,
      types: new Map(Object.entries(definition.types)),
      resolvedTypes: new Map(Object.entries(definition.types))
    };

    // Add to registry
    this.schemaRegistry.schemas.set(definition.name, schema);
    
    return { isValid: true, errors: [] };
  }

  exportNamespace(name: string): NamespaceDefinition {
    const namespace = this.getNamespace(name);
    if (!namespace) {
      throw new Error(`Namespace ${name} not found`);
    }
    
    return namespace.export();
  }

  validateNamespace(definition: NamespaceDefinition): ValidationResult {
    // Basic validation
    if (!definition.name || !definition.types) {
      return { isValid: false, errors: ["Invalid namespace definition"] };
    }
    
    return { isValid: true, errors: [] };
  }

  validateTypeDefinition(typeDef: TypeMeta): ValidationResult {
    // Basic validation
    if (!typeDef.qName || !typeDef.properties) {
      return { isValid: false, errors: ["Invalid type definition"] };
    }
    
    return { isValid: true, errors: [] };
  }

  getInfo(): RegistryInfo {
    return {
      url: "local://memory",
      name: "Local Schema Registry",
      description: "Memory-based schema registry adapter",
      version: "1.0.0",
      created: new Date(),
      lastModified: new Date()
    };
  }
}