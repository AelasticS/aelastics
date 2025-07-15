import { TypeMeta } from "./TypeDefinitions";

/** Namespace metadata - container of type definitions with import/export support */
export interface Namespace {
    qName: string; // Qualified name (path) of the namespace
    label?: string; // Human-readable label for the namespace
    version?: string; // Namespace version
    parentNamespace?: string; // Full path of the parent namespace (for hierarchy)
    
    // Type definitions stored as TypeScript Maps for efficiency
    types: Map<string, TypeMeta>; // Type name -> TypeMeta mapping
    
    // Import/Export system (like TypeScript modules)
    exports: string[]; // List of exported type names
    imports: Map<string, string[]>; // Imported namespace path -> imported type names
    
    // Additional metadata
    description?: string; // Namespace description
    created?: Date; // Creation timestamp
    lastModified?: Date; // Last modification timestamp
}

/** Registry metadata - container of multiple namespaces */
export interface RegistryMetadata {
    namespaces: Map<string, Namespace>; // Namespace qualified name -> Namespace mapping
    
    // Registry information
    name: string; // Registry name
    description?: string; // Registry description
    version?: string; // Registry version
    created?: Date; // Creation timestamp
    lastModified?: Date; // Last modification timestamp
}

/** Validation result for import/export operations */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

/** Import validation context */
export interface ImportContext {
    sourceNamespace: string; // Namespace performing the import
    targetNamespace: string; // Namespace being imported
    importedTypes: string[]; // Types being imported
}

/** Utility functions for namespace operations */

/**
 * Extract local name from fully qualified name
 * @param qName - Qualified name like "/company/users/User"
 * @returns Local name like "User"
 */
export function getLocalName(qName: string): string {
    return qName.split('/').pop() || qName;
}

/**
 * Extract namespace path from fully qualified type name
 * @param typeQName - Qualified type name like "/company/users/User"
 * @returns Namespace path like "/company/users"
 */
export function getNamespacePath(typeQName: string): string {
    const parts = typeQName.split('/');
    parts.pop(); // Remove type name
    return parts.join('/') || '/';
}

/**
 * Build qualified type name from namespace path and type name
 * @param namespacePath - Namespace path like "/company/users"
 * @param typeName - Type name like "User"
 * @returns Qualified name like "/company/users/User"
 */
export function buildQualifiedName(namespacePath: string, typeName: string): string {
    const cleanPath = namespacePath.endsWith('/') ? namespacePath.slice(0, -1) : namespacePath;
    return `${cleanPath}/${typeName}`;
}

/**
 * Check if namespace has hierarchy relationship
 * @param childPath - Child namespace path
 * @param parentPath - Parent namespace path
 * @returns True if child is under parent in hierarchy
 */
export function isSubNamespace(childPath: string, parentPath: string): boolean {
    return childPath.startsWith(parentPath + '/');
}

/**
 * Get all type names that are available in a namespace (including imported types)
 * @param namespace - Namespace to check
 * @param registry - Registry containing all namespaces
 * @returns Set of available type names
 */
export function getAvailableTypes(namespace: Namespace, registry: RegistryMetadata): Set<string> {
    const availableTypes = new Set<string>();
    
    // Add local types
    for (const typeName of namespace.types.keys()) {
        availableTypes.add(typeName);
    }
    
    // Add imported types
    if (namespace.imports) {
        for (const [importedNamespacePath, importedTypeNames] of namespace.imports) {
            const importedNamespace = registry.namespaces.get(importedNamespacePath);
            if (importedNamespace && importedNamespace.exports) {
                for (const typeName of importedTypeNames) {
                    if (importedNamespace.exports.includes(typeName)) {
                        availableTypes.add(typeName);
                    }
                }
            }
        }
    }
    
    return availableTypes;
}

/**
 * Resolve qualified name for a type reference within a namespace context
 * @param typeName - Type name to resolve
 * @param contextNamespace - Namespace context for resolution
 * @param registry - Registry containing all namespaces
 * @returns Qualified type name if found, undefined otherwise
 */
export function resolveTypeReference(
    typeName: string, 
    contextNamespace: Namespace, 
    registry: RegistryMetadata
): string | undefined {
    // Check local types first
    if (contextNamespace.types.has(typeName)) {
        return buildQualifiedName(contextNamespace.qName, typeName);
    }
    
    // Check imported types
    if (contextNamespace.imports) {
        for (const [importedNamespacePath, importedTypeNames] of contextNamespace.imports) {
            if (importedTypeNames.includes(typeName)) {
                const importedNamespace = registry.namespaces.get(importedNamespacePath);
                if (importedNamespace && 
                    importedNamespace.exports?.includes(typeName) &&
                    importedNamespace.types.has(typeName)) {
                    return buildQualifiedName(importedNamespacePath, typeName);
                }
            }
        }
    }
    
    return undefined;
}