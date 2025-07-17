/**
 * Invalid Namespace Examples for Testing Error Detection
 * 
 * This module provides intentionally incorrect namespace definitions to test
 * the validation capabilities of the RegistryService.
 * 
 * Error Types Covered:
 * 
 * 1. **Missing Imports**: References to types from other namespaces without proper imports
 * 2. **Invalid qNames**: Malformed qualified names (missing slash, trailing slash, empty segments, invalid characters)
 * 3. **System Conflicts**: Attempting to redefine system types or use reserved 'system' namespace name
 * 4. **Invalid References**: Property type references to non-existent types, missing optional flags
 * 5. **Invalid Imports**: Importing from non-existent namespaces, non-exported types, circular dependencies
 * 6. **Invalid Entities**: Missing identity keys, invalid identity key references, invalid inheritance
 * 7. **Duplicate Names**: Duplicate type names and namespace qNames
 * 8. **Invalid Subtypes**: Invalid base type references, circular subtype dependencies, duplicate properties
 */

// Import all invalid namespaces
export { missingImportsNamespace } from "./missing-imports-namespace";
export { invalidQNamesNamespace } from "./invalid-qnames-namespace";
export { systemConflictsNamespace, reservedSystemNamespace } from "./system-conflicts-namespace";
export { invalidReferencesNamespace } from "./invalid-references-namespace";
export { invalidImportsNamespace, circularImportNamespaceA, circularImportNamespaceB } from "./invalid-imports-namespace";
export { invalidEntitiesNamespace } from "./invalid-entities-namespace";
export { duplicateNamesNamespace, duplicateNamespaceQName } from "./duplicate-names-namespace";
export { invalidSubtypesNamespace } from "./invalid-subtypes-namespace";

// Export arrays for easy iteration in tests
export const invalidNamespaces = [
    "missingImportsNamespace",
    "invalidQNamesNamespace", 
    "systemConflictsNamespace",
    "reservedSystemNamespace",
    "invalidReferencesNamespace",
    "invalidImportsNamespace",
    "invalidEntitiesNamespace",
    "duplicateNamesNamespace",
    "duplicateNamespaceQName",
    "invalidSubtypesNamespace"
] as const;

export const circularDependencyNamespaces = [
    "circularImportNamespaceA",
    "circularImportNamespaceB"
] as const;

/**
 * Expected error types for each invalid namespace:
 * 
 * - missingImportsNamespace: "Imported namespace does not exist"
 * - invalidQNamesNamespace: "Invalid qualified name"
 * - systemConflictsNamespace: "Type name conflicts with system type", "Namespace 'system' is reserved"
 * - reservedSystemNamespace: "Namespace 'system' is reserved"
 * - invalidReferencesNamespace: "Property references unknown type", "Base type not found", "missing required 'optional' flag"
 * - invalidImportsNamespace: "Imported namespace does not exist", "Type is not exported by namespace"
 * - invalidEntitiesNamespace: "Identity key property not found", "Base type is not an object type"
 * - duplicateNamesNamespace: "Namespace already exists"
 * - duplicateNamespaceQName: "Namespace already exists"
 * - circularImportNamespaceA/B: "Circular import dependencies detected"
 * - invalidSubtypesNamespace: "Base type not found", "Property already exists in base type", "Circular subtype dependency"
 */