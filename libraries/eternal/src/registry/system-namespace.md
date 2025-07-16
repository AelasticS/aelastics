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