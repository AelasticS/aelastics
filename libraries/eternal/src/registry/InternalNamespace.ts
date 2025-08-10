import { Namespace, ImportEntry, RegistryMetadata } from './NamespaceMetadata';
import { TypeMeta, ObjectTypeMeta, isObjectType, isSimpleType, TypeKind } from './TypeDefinitions';

/**
 * Internal namespace implementation with resolved types optimization
 * This class provides O(1) type lookup performance through pre-computed resolved types
 */
export class InternalNamespace implements Namespace {
    public readonly qName: string;
    public readonly label?: string;
    public readonly parentNamespace?: string;
    public readonly types: Map<string, TypeMeta>;
    public readonly exports: string[];
    public readonly imports: Map<string, ImportEntry[]>;
    
    /** Pre-computed map of all available types (local + imported) for O(1) lookup */
    private resolvedTypes: Map<string, TypeMeta> = new Map();
    
    constructor(namespace: Namespace) {
        this.qName = namespace.qName;
        this.label = namespace.label;
        this.parentNamespace = namespace.parentNamespace;
        this.types = namespace.types;
        this.exports = namespace.exports;
        this.imports = namespace.imports;
    }
    
    /**
     * Compute resolved types map for this namespace
     * Based on existing computeResolvedTypes logic from SchemaRegistry
     * @param registry The registry metadata for resolving imports
     * @returns Array of error messages, empty if successful
     */
    public computeResolvedTypes(registry: RegistryMetadata): string[] {
        const errors: string[] = [];
        
        // Initialize resolved types with local types
        this.resolvedTypes.clear();
        for (const [typeName, typeMeta] of this.types) {
            this.resolvedTypes.set(typeName, typeMeta);
        }
        
        // Process imports if they exist
        if (this.imports.size === 0) {
            return errors; // No imports, early return
        }
        
        // Process each imported namespace
        for (const [importedNamespacePath, importEntries] of this.imports) {
            const importedNamespace = registry.namespaces.get(importedNamespacePath);
            
            if (!importedNamespace) {
                errors.push(`Imported namespace '${importedNamespacePath}' does not exist`);
                continue;
            }
            
            // Process each import entry
            for (const importEntry of importEntries) {
                if (importEntry === '*') {
                    // Wildcard import - import all exported types
                    const wildcardErrors = this.processWildcardImport(importedNamespace, importedNamespacePath);
                    errors.push(...wildcardErrors);
                } else if (typeof importEntry === 'string') {
                    // Direct import - import specific type
                    const directErrors = this.processDirectImport(importEntry, importedNamespace, importedNamespacePath);
                    errors.push(...directErrors);
                } else {
                    // Aliased import - import type with different name
                    const aliasErrors = this.processAliasedImport(importEntry, importedNamespace, importedNamespacePath);
                    errors.push(...aliasErrors);
                }
            }
        }
        
        // Derive inverseType optimizations after all types are resolved
        const derivationErrors = this.deriveInverseTypeOptimizations(registry);
        errors.push(...derivationErrors);
        
        return errors;
    }
    
    /**
     * Process wildcard import ("*") - import all exported types
     */
    private processWildcardImport(importedNamespace: Namespace, importedNamespacePath: string): string[] {
        const errors: string[] = [];
        
        // Check if imported namespace has exports
        if (!importedNamespace.exports || importedNamespace.exports.length === 0) {
            errors.push(`Namespace '${importedNamespacePath}' has no exports for wildcard import`);
            return errors;
        }
        
        // Import all exported types
        for (const exportedTypeName of importedNamespace.exports) {
            const exportedType = importedNamespace.types.get(exportedTypeName);
            
            if (!exportedType) {
                errors.push(`Exported type '${exportedTypeName}' does not exist in namespace '${importedNamespacePath}'`);
                continue;
            }
            
            // Check for conflicts with existing types
            if (this.resolvedTypes.has(exportedTypeName)) {
                errors.push(`Type '${exportedTypeName}' already exists in namespace '${this.qName}' (imported from '${importedNamespacePath}')`);
                continue;
            }
            
            // Add to resolved types
            this.resolvedTypes.set(exportedTypeName, exportedType);
        }
        
        return errors;
    }
    
    /**
     * Process direct import - import specific type by name
     */
    private processDirectImport(typeName: string, importedNamespace: Namespace, importedNamespacePath: string): string[] {
        const errors: string[] = [];
        
        // Check if type is exported
        if (!importedNamespace.exports.includes(typeName)) {
            errors.push(`Type '${typeName}' is not exported by namespace '${importedNamespacePath}'`);
            return errors;
        }
        
        // Check if type exists in source namespace
        const importedType = importedNamespace.types.get(typeName);
        if (!importedType) {
            errors.push(`Type '${typeName}' does not exist in namespace '${importedNamespacePath}'`);
            return errors;
        }
        
        // Check for conflicts with existing types
        if (this.resolvedTypes.has(typeName)) {
            errors.push(`Type '${typeName}' already exists in namespace '${this.qName}' (imported from '${importedNamespacePath}')`);
            return errors;
        }
        
        // Add to resolved types
        this.resolvedTypes.set(typeName, importedType);
        
        return errors;
    }
    
    /**
     * Process aliased import - import type with different local name
     */
    private processAliasedImport(
        importEntry: { original: string; alias: string }, 
        importedNamespace: Namespace, 
        importedNamespacePath: string
    ): string[] {
        const errors: string[] = [];
        const { original, alias } = importEntry;
        
        // Check if original type is exported
        if (!importedNamespace.exports.includes(original)) {
            errors.push(`Type '${original}' is not exported by namespace '${importedNamespacePath}'`);
            return errors;
        }
        
        // Check if original type exists in source namespace
        const importedType = importedNamespace.types.get(original);
        if (!importedType) {
            errors.push(`Type '${original}' does not exist in namespace '${importedNamespacePath}'`);
            return errors;
        }
        
        // Check for conflicts with existing types (using alias name)
        if (this.resolvedTypes.has(alias)) {
            errors.push(`Alias '${alias}' already exists in namespace '${this.qName}' (importing '${original}' from '${importedNamespacePath}')`);
            return errors;
        }
        
        // Add to resolved types under alias name
        this.resolvedTypes.set(alias, importedType);
        
        return errors;
    }
    
    /**
     * Get a resolved type by name (O(1) lookup)
     * @param typeName The type name to look up
     * @returns The type metadata or undefined if not found
     */
    public getResolvedType(typeName: string): TypeMeta | undefined {
        return this.resolvedTypes.get(typeName);
    }
    
    /**
     * Get all available type names in this namespace
     * @returns Array of type names (local + imported)
     */
    public getAvailableTypeNames(): string[] {
        return Array.from(this.resolvedTypes.keys());
    }
    
    /**
     * Get all resolved types (for debugging/inspection)
     * @returns Map of resolved types
     */
    public getResolvedTypes(): Map<string, TypeMeta> {
        return new Map(this.resolvedTypes);
    }
    
    /**
     * Check if a type is available in this namespace
     * @param typeName The type name to check
     * @returns true if type is available
     */
    public hasType(typeName: string): boolean {
        return this.resolvedTypes.has(typeName);
    }
    
    /**
     * Detect circular import dependencies using depth-first search
     * @param registry The registry metadata
     * @param visited Set of already visited namespaces (for recursion)
     * @returns Array of error messages describing circular dependencies
     */
    public detectCircularImports(registry: RegistryMetadata, visited: Set<string> = new Set()): string[] {
        const errors: string[] = [];
        
        // Check if we've already visited this namespace (circular dependency)
        if (visited.has(this.qName)) {
            const cycle = Array.from(visited).join(' -> ') + ' -> ' + this.qName;
            errors.push(`Circular import dependency detected: ${cycle}`);
            return errors;
        }
        
        // Add this namespace to visited set
        visited.add(this.qName);
        
        // Check all imported namespaces
        for (const [importedNamespacePath] of this.imports) {
            const importedNamespace = registry.namespaces.get(importedNamespacePath);
            
            if (!importedNamespace) {
                // Skip missing namespaces - they will be caught by other validation
                continue;
            }
            
            // If the imported namespace is also an InternalNamespace, check for circular dependencies
            if (importedNamespace instanceof InternalNamespace) {
                const circularErrors = importedNamespace.detectCircularImports(registry, new Set(visited));
                errors.push(...circularErrors);
            }
        }
        
        // Remove this namespace from visited set (backtrack)
        visited.delete(this.qName);
        
        return errors;
    }

    /**
     * Derive inverseType optimizations for bidirectional relationships
     * This resolves inverseTypeRef strings to TypeKind values
     * @param registry The registry metadata for resolving type references
     * @returns Array of error messages, empty if successful
     */
    private deriveInverseTypeOptimizations(registry: RegistryMetadata): string[] {
        const errors: string[] = [];
        
        // Process all local types in this namespace
        for (const [, typeMeta] of this.types) {
            if (isObjectType(typeMeta)) {
                const objectType = typeMeta as ObjectTypeMeta;
                
                // Process each property in the object type
                for (const [propName, propertyMeta] of objectType.properties) {
                    if (propertyMeta.inverseTypeRef && propertyMeta.inverseProp) {
                        // Validate that simple properties cannot have inverse relationships
                        const currentPropertyType = this.resolveTypeReference(propertyMeta.typeRef, registry);
                        if (currentPropertyType && isSimpleType(currentPropertyType)) {
                            errors.push(
                                `Simple property '${propName}' of type '${propertyMeta.typeRef}' cannot have inverse relationship. ` +
                                `Inverse relationships are only allowed for entity/object properties and collections.`
                            );
                            continue;
                        }
                        
                        try {
                            // Resolve the type containing the inverse property
                            const inverseContainerType = this.resolveTypeReference(propertyMeta.inverseTypeRef, registry);
                            
                            if (inverseContainerType && isObjectType(inverseContainerType)) {
                                const inverseContainerObject = inverseContainerType as ObjectTypeMeta;
                                
                                // Get the inverse property from the container type
                                const inverseProperty = inverseContainerObject.properties.get(propertyMeta.inverseProp!);
                                
                                if (inverseProperty) {
                                    // Resolve the type of the inverse property itself
                                    const inversePropertyType = this.resolveTypeReference(inverseProperty.typeRef, registry);
                                    
                                    if (inversePropertyType) {
                                        // Derive TypeKind from the inverse property's type
                                        let inverseTypeKind: TypeKind;
                                        if (inversePropertyType.kind === 'object' || inversePropertyType.kind === 'entity') {
                                            inverseTypeKind = 'object';
                                        } else {
                                            inverseTypeKind = inversePropertyType.kind;
                                        }
                                        
                                        // Set the derived TypeKind value
                                        propertyMeta.inverseType = inverseTypeKind;
                                    } else {
                                        errors.push(`Cannot resolve inverse property type '${inverseProperty.typeRef}' for property '${propName}' in type '${typeMeta.qName}'`);
                                    }
                                } else {
                                    errors.push(`Inverse property '${propertyMeta.inverseProp}' not found in type '${propertyMeta.inverseTypeRef}' for property '${propName}' in type '${typeMeta.qName}'`);
                                }
                            } else {
                                errors.push(`Cannot resolve inverse type reference '${propertyMeta.inverseTypeRef}' for property '${propName}' in type '${typeMeta.qName}'`);
                            }
                        } catch (error) {
                            errors.push(`Error deriving inverse type for property '${propName}' in type '${typeMeta.qName}': ${error}`);
                        }
                    }
                }
            }
        }
        
        return errors;
    }

    /**
     * Helper method to resolve a type reference to TypeMeta
     * This looks up types in the current namespace and imported namespaces
     */
    private resolveTypeReference(typeRef: string, registry: RegistryMetadata): TypeMeta | undefined {
        // Try to resolve from global registry first (for absolute references like "/namespace/Type")
        if (typeRef.startsWith('/')) {
            // Split the qualified name to get namespace and type name
            const parts = typeRef.split('/');
            const namespacePath = '/' + parts.slice(1, -1).join('/');
            const typeName = parts[parts.length - 1];
            
            // Check if this is a self-reference to the current namespace being imported
            if (namespacePath === this.qName) {
                return this.types.get(typeName);
            }
            
            // Try to resolve from registry (for already imported namespaces)
            const targetNamespace = registry.namespaces.get(namespacePath);
            if (targetNamespace) {
                return targetNamespace.types.get(typeName);
            }
        }
        
        // Try to resolve from resolved types (local + imported types)
        return this.resolvedTypes.get(typeRef);
    }
}