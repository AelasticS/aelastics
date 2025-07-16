import { TypeMeta } from "./TypeDefinitions";

/** Import entry - supports wildcards and aliasing */
export type ImportEntry = string | { original: string; alias: string };

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
    imports: Map<string, ImportEntry[]>; // Imported namespace path -> imported entries (supports wildcards and aliases)
    
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
 * @deprecated Use InternalNamespace.getAvailableTypeNames() for better performance
 */
export function getAvailableTypes(namespace: Namespace, registry: RegistryMetadata): Set<string> {
    const availableTypes = new Set<string>();
    
    // Add local types
    for (const typeName of namespace.types.keys()) {
        availableTypes.add(typeName);
    }
    
    // Add imported types
    if (namespace.imports) {
        for (const [importedNamespacePath, importedEntries] of namespace.imports) {
            const importedNamespace = registry.namespaces.get(importedNamespacePath);
            if (importedNamespace && importedNamespace.exports) {
                for (const entry of importedEntries) {
                    if (entry === "*") {
                        // Wildcard import - add all exported types
                        for (const exportedType of importedNamespace.exports) {
                            availableTypes.add(exportedType);
                        }
                    } else if (typeof entry === "string") {
                        // Regular import
                        if (importedNamespace.exports.includes(entry)) {
                            availableTypes.add(entry);
                        }
                    } else {
                        // Aliased import
                        if (importedNamespace.exports.includes(entry.original)) {
                            availableTypes.add(entry.alias);
                        }
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
 * @deprecated Use InternalNamespace.getResolvedType() for better performance
 */
export function resolveTypeReference(
    typeName: string, 
    contextNamespace: Namespace, 
    registry: RegistryMetadata
): string | undefined {
    // Handle absolute paths (start with /)
    if (typeName.startsWith('/')) {
        const namespacePath = getNamespacePath(typeName);
        const localName = getLocalName(typeName);
        const targetNamespace = registry.namespaces.get(namespacePath);
        if (targetNamespace && targetNamespace.types.has(localName)) {
            return typeName; // Already qualified
        }
        return undefined;
    }
    
    // Handle parent paths (contain ..)
    if (typeName.includes('..')) {
        return resolveParentPath(typeName, contextNamespace, registry);
    }
    
    // Handle sub-namespace paths (contain / but don't start with /)
    if (typeName.includes('/')) {
        return resolveSubNamespacePath(typeName, contextNamespace, registry);
    }
    
    // Handle simple names - check local types first
    if (contextNamespace.types.has(typeName)) {
        return buildQualifiedName(contextNamespace.qName, typeName);
    }
    
    // Check imported types
    if (contextNamespace.imports) {
        for (const [importedNamespacePath, importedEntries] of contextNamespace.imports) {
            const importedNamespace = registry.namespaces.get(importedNamespacePath);
            if (!importedNamespace) continue;
            
            for (const entry of importedEntries) {
                if (entry === "*") {
                    // Wildcard import - check if type is exported
                    if (importedNamespace.exports?.includes(typeName) &&
                        importedNamespace.types.has(typeName)) {
                        return buildQualifiedName(importedNamespacePath, typeName);
                    }
                } else if (typeof entry === "string") {
                    // Regular import
                    if (entry === typeName && 
                        importedNamespace.exports?.includes(typeName) &&
                        importedNamespace.types.has(typeName)) {
                        return buildQualifiedName(importedNamespacePath, typeName);
                    }
                } else {
                    // Aliased import - check if we're looking for the alias
                    if (entry.alias === typeName && 
                        importedNamespace.exports?.includes(entry.original) &&
                        importedNamespace.types.has(entry.original)) {
                        return buildQualifiedName(importedNamespacePath, entry.original);
                    }
                }
            }
        }
    }
    
    return undefined;
}

/**
 * Resolve parent path references (containing ..)
 * @param typeName - Type reference like "../Company" or "../../base/Entity"
 * @param contextNamespace - Current namespace context
 * @param registry - Registry containing all namespaces
 * @returns Qualified type name if found, undefined otherwise
 */
function resolveParentPath(
    typeName: string,
    contextNamespace: Namespace,
    registry: RegistryMetadata
): string | undefined {
    const pathSegments = typeName.split('/');
    const currentPathSegments = contextNamespace.qName.split('/').filter(s => s !== '');
    
    let resolvedPathSegments = [...currentPathSegments];
    let typeNameToFind = '';
    
    for (const segment of pathSegments) {
        if (segment === '..') {
            // Go up one level
            if (resolvedPathSegments.length > 0) {
                resolvedPathSegments.pop();
            }
        } else if (segment !== '') {
            // This should be the type name (last segment)
            typeNameToFind = segment;
            break;
        }
    }
    
    if (!typeNameToFind) {
        return undefined;
    }
    
    // Build the target namespace path
    const targetNamespacePath = resolvedPathSegments.length > 0 
        ? '/' + resolvedPathSegments.join('/') 
        : '/';
    
    // Check if the target namespace exists and has the type
    const targetNamespace = registry.namespaces.get(targetNamespacePath);
    if (targetNamespace && targetNamespace.types.has(typeNameToFind)) {
        return buildQualifiedName(targetNamespacePath, typeNameToFind);
    }
    
    return undefined;
}

/**
 * Resolve sub-namespace path references (like "department/Manager")
 * @param typeName - Type reference like "department/Manager" or "utils/helpers/Helper"
 * @param contextNamespace - Current namespace context
 * @param registry - Registry containing all namespaces
 * @returns Qualified type name if found, undefined otherwise
 */
function resolveSubNamespacePath(
    typeName: string,
    contextNamespace: Namespace,
    registry: RegistryMetadata
): string | undefined {
    const pathSegments = typeName.split('/');
    const typeNameToFind = pathSegments.pop(); // Last segment is the type name
    
    if (!typeNameToFind || pathSegments.length === 0) {
        return undefined;
    }
    
    // Build the target namespace path relative to current namespace
    const currentPath = contextNamespace.qName === '/' ? '' : contextNamespace.qName;
    const subPath = pathSegments.join('/');
    const targetNamespacePath = currentPath + '/' + subPath;
    
    // Check if the target namespace exists and has the type
    const targetNamespace = registry.namespaces.get(targetNamespacePath);
    if (targetNamespace && targetNamespace.types.has(typeNameToFind)) {
        return buildQualifiedName(targetNamespacePath, typeNameToFind);
    }
    
    return undefined;
}