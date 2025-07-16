# Namespace Semantics and System Namespace Rules

## Overview

Namespaces are containers for types that provide modularity, isolation, and hierarchical organization. They allow types to be grouped, prevent naming conflicts, and support type referencing across different parts of the system. The following sections explain these characteristics in detail.

Namespaces provide a way to organize and isolate type definitions in the system. Each namespace contains a set of types, and type names are resolved relative to their namespace. This structure prevents naming conflicts and enables modularity.

## Naming Conventions and Qualified Names

- Type names and namespace names should be chosen to avoid conflicts with reserved names, especially `system`.
- The `qName` of a type is a path to the type definition (or namespace). The path can be specified in several ways:
  - **Absolute path**: Starts with `/` and is resolved from the root. Example: `/company/worker` refers to the `worker` type in the `company` namespace at the root level.
  - **Relative path**: Does not start with `/` and is resolved relative to the current namespace. Example: `person` refers to the `person` type in the same namespace.
  - **Parent path (`..`)**: Includes `..` segments to climb up the namespace hierarchy. Example: `../person` refers to the `person` type in the parent namespace.
  - **Relative path with sub-namespace**: You can start with a relative namespace and use `/` to reach a type in a child namespace. Example: `department/manager` refers to the `manager` type in the `department` child namespace of the current namespace.
- Each namespace can have a parent namespace (its name is unique within the parent namespace, similar to other types) and can have several child namespaces.
- The `qName` of a type is typically its simple name within its namespace. For example, the `qName` of the string type in the system namespace is just `string`.
- When referencing a type from another namespace, use its qualified name if necessary, but standard types from the system namespace can always be referenced by their simple name.

## Exporting and Importing Types and Namespaces

- A namespace can export its defined types and child namespaces, making them available for use in other namespaces.
- A namespace can import types and namespaces from other namespaces. This enables it to reference types defined in imported namespaces.
- Imports support both aliasing (renaming imported types or namespaces) and the `*` notation (importing all exported members), similar to import statements in TypeScript.

## The System Namespace

A dedicated namespace named `system` is defined in the file `system-namespace.ts`. This namespace contains all standard primitive types (such as `string`, `number`, `boolean`, etc.) and is a core part of the type system.

### Rules for the System Namespace

- The name `system` is reserved exclusively for the system namespace and its standard types. No user-defined namespace can have the name `system`.
- All standard primitive types are defined in the `system` namespace, with their `qName` set to their simple name (e.g., `string`, `number`).
- The system namespace is always present in every registry. When a new registry is created, the system namespace is automatically included.
- When importing any other namespace, the system namespace is automatically imported as well. This ensures that standard types are always available for type resolution.
- Types from the system namespace can be referenced by their simple name (e.g., `string`, `number`) in any other namespace. These names cannot be redefined locally in other namespaces, preventing naming conflicts with standard types.
- When resolving types in an imported namespace, standard types from the system namespace (with their relative names) are inserted into the resolved type map. This guarantees that names in the imported namespace cannot clash with types from the system namespace.

## Real-World Examples

Suppose you have the following namespace structure:

- `/company` (namespace)
  - `worker` (type)
  - `department` (namespace)
    - `manager` (type)
  - `person` (type)

Examples of `qName` usage:
- In `/company/department`, `../person` refers to the `person` type in the parent `/company` namespace.
- In `/company/department`, `manager` refers to the `manager` type in the same namespace.
- In `/company`, `/system/string` or just `string` refers to the standard string type from the system namespace.
- In `/company`, `/company/worker` refers to the `worker` type in the root `company` namespace.

### Example: Using Types from the System Namespace

Suppose you define a `worker` type in the `/company` namespace:

```typescript
// In /company namespace
type worker = {
  id: string; // Uses the 'string' type from the system namespace
  age: number; // Uses the 'number' type from the system namespace
}
```

Here, both `string` and `number` are resolved from the system namespace, and can be referenced simply by their names.

## Summary

- The system namespace provides a consistent, conflict-free set of standard types for all namespaces.
- The rules above ensure reliable type resolution, prevent naming conflicts, and maintain clarity in type and namespace organization throughout the system.


----

Here’s a review of whether the rules from above satisfied in your RegistryService.ts implementation:

1. System namespace is always present in every registry
Current state:
There is no code in the RegistryService constructor or anywhere else that ensures the system namespace is always present when a registry is created.
Action needed:
You should add logic to automatically add/import the system namespace (from system-namespace.ts) to the registry in the constructor if it is not already present.
2. When importing any other namespace, the system namespace is automatically imported as well
Current state:
The importNamespace method does not automatically import the system namespace into the imported namespace or ensure its types are available for resolution.
Action needed:
You should update importNamespace to ensure that the system namespace is always available in the imported namespace’s imports (if not already present).
3. Types from the system namespace can be referenced by their simple name in any other namespace, and cannot be redefined locally
Current state:
There is no explicit check in validateNamespaceForImport or type resolution logic to prevent a namespace from defining a type with the same name as a system type, nor to ensure that system types are always available by simple name.
Action needed:
Add a check in validateNamespaceForImport to prevent local type names from clashing with system type names.
Ensure type resolution logic (e.g., in getTypeInNamespace or resolveTypeReference) always checks the system namespace for simple names if not found locally.
4. Uniqueness and fast access using maps
Current state:
The typeIndex map and internalNamespaces map are used for fast lookup and uniqueness of types by qualified name.
The buildTypeIndex method builds a map of all types by qualified name.
There is a check for duplicate namespaces in validateNamespaceForImport.
Action needed:
For type uniqueness, ensure that the combination of namespace and type name is unique, and that system type names are not duplicated in user namespaces.
5. No user-defined namespace can have the name system
Current state:
There is no explicit check in validateNamespaceForImport to prevent a user from creating a namespace named system.
Action needed:
Add a check in validateNamespaceForImport to reject any namespace with the name system (except the actual system namespace).
Summary:

The current implementation does not fully enforce the system namespace rules described in your documentation.
You need to:
Ensure the system namespace is always present in the registry.
Automatically import the system namespace when importing any other namespace.
Prevent type name clashes with system types.
Prevent user-defined namespaces named system.
Ensure type resolution always considers system types by simple name.

---
Based on the code in RegistryService.ts, here’s how path resolution is handled for type references in interfaces (e.g., property types, subtypes, etc.):

Path Forms Supported
1. Absolute Path (/company/worker)
Supported:
The code checks if a type reference starts with / and treats it as an absolute qualified name.
In validateObjectType, if propMeta.typeRef.startsWith('/'), it checks the registry and the namespace for the type.
In validateType, the same logic applies for extends (subtype).
2. Relative Path (person)
Supported:
If the type reference does not start with /, it is treated as a local name and resolved using resolveTypeReference, which is expected to handle relative resolution within the current namespace.
3. Parent Path (../person)
Supported (Assumed):
The function resolveTypeReference is called for non-absolute paths. If this function is implemented to handle .. segments (as described in your docs), then parent path resolution is supported.
The code itself delegates to resolveTypeReference for this logic.
4. Relative Path with Sub-namespace (department/manager)
Supported (Assumed):
Again, as long as resolveTypeReference is implemented to handle paths like department/manager relative to the current namespace, this is supported.
Where Path Resolution is Used
Property Types:
In validateObjectType, for each property, the type reference is resolved using the above logic.
Subtype Inheritance:
In validateObjectType, for extends, the type reference is resolved using the same logic.
Inverse Relationships:
In validateObjectType, for inverseCollection, the target type reference is resolved using the same logic.
What to Check
The actual support for .. and sub-namespace resolution depends on the implementation of resolveTypeReference in your NamespaceMetadata module.
If resolveTypeReference is robust and follows the path rules described in your documentation, then all forms of paths are supported in type references for interfaces, subtypes, and properties.
Summary:

The code in RegistryService.ts is structured to support all forms of paths for type references, as long as resolveTypeReference is implemented according to your path rules (absolute, relative, parent, sub-namespace).
You should review or test resolveTypeReference to ensure it handles all these cases as described in your documentation.

Can you verify if everything said above is  valid in and defined rueks respected in of RegistryServices.ts 

THen verify and updayte the follwing test files #file:new-registry-service.test.ts , #file:type-definitions.test.ts , #file:import-export-optimization.test.ts , #file:namespace-metadata.test.ts , so that they asert respect of defined rules