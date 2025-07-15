# Registry Type System Specification

## Overview

The Registry Type System provides a comprehensive, hierarchical namespace-based type management system for the eternal library. It supports complex type definitions, inheritance, imports/exports, and bidirectional relationships while maintaining performance through internal optimizations.

## Core Architecture

### Namespace Organization
- **Hierarchical Structure**: Namespaces are organized in a tree-like hierarchy (e.g., `/company/users`, `/company/products`)
- **Qualified Names**: All types have fully qualified names (e.g., `/company/users/User`)
- **Parent-Child Relationships**: Namespaces can have parent-child relationships for organization
- **Import/Export System**: TypeScript-like module system for cross-namespace type usage

### Type Categories

The registry supports two main type categories:

#### 1. Simple Types

Basic primitive types that don't contain other types:

- `string` - Text data
- `number` - Numeric data
- `boolean` - True/false values
- `date` - Date/time values
- `void` - No value
- `unknown` - Unknown type
- `any` - Any type (escape hatch)

#### 2. Complex Types

Composite types that contain or reference other types:

- `object` - Object/record type with properties
- `entity` - Object with identity keys and lifecycle management
- `objectRef` - Reference to another object/entity type
- `array` - Ordered collection of elements
- `map` - Key-value mapping
- `set` - Unordered collection of unique elements
- `union` - One of several possible types (normal union)
- `taggedUnion` - Union with discriminator property for type identification
- `intersection` - All of several types combined
- `tuple` - Fixed-length array with specific types
- `function` - Function type with parameters and return type
- `subtype` - Refined/constrained version of another type

## Type Definitions

### Property Metadata
Each property in a type has the following metadata:

```typescript
interface PropertyMeta {
    name: string;           // Property name
    typeRef: string;        // Reference to type (qualified name)
    optional: boolean;      // Whether property is optional
    inverseProp?: string;   // Name of inverse property (for bidirectional relationships)
    inverseTypeRef?: string; // Type of inverse property
}
```

### Object Types
Object types define structured data with properties:

```typescript
interface ObjectTypeMeta {
    qName: string;                           // Fully qualified name
    category: "complex";                     // Type category
    kind: "object" | "entity";               // Object or entity
    properties: Map<string, PropertyMeta>;   // Property definitions
    extends?: string;                        // Base type (inheritance)
    identityKeys?: string[];                 // Identity properties (entities only)
    inverseCollection?: Map<string, InverseCollectionMeta>; // Bidirectional relationships
}
```

### Entity Types
Entities are special objects with identity and lifecycle management:
- **Identity Keys**: Properties that uniquely identify the entity
- **Lifecycle Management**: Creation, modification, deletion tracking
- **Bidirectional Relationships**: Automatic inverse relationship maintenance

### Array Types
Arrays represent ordered collections:

```typescript
interface ArrayTypeMeta {
    qName: string;           // Fully qualified name
    category: "complex";     // Type category
    kind: "array";           // Array type
    elementType: string;     // Type of array elements
}
```

### Union Types

Unions represent "one of" relationships with two variants:

#### Normal Union
Standard union type where value can be any of the union members:

```typescript
interface UnionTypeMeta {
    qName: string;           // Fully qualified name
    category: "complex";     // Type category
    kind: "union";           // Union type
    unionTypes: string[];    // Types in the union
}
```

#### Tagged Union
Union with a discriminator property to identify which member is active:

```typescript
interface TaggedUnionTypeMeta {
    qName: string;           // Fully qualified name
    category: "complex";     // Type category
    kind: "taggedUnion";     // Tagged union type
    discriminator: string;   // Property name used to distinguish union members
    unionTypes: TaggedUnionMember[]; // Union members with their discriminator values
}

interface TaggedUnionMember {
    typeRef: string;         // Reference to the union member type
    discriminatorValue: any; // Value of discriminator property for this member
}
```

### Function Types

Functions represent callable operations:

```typescript
interface FunctionTypeMeta {
    qName: string;                    // Fully qualified name
    category: "complex";              // Type category
    kind: "function";                 // Function type
    parameters: ParameterMeta[];      // Function parameters
    returnType: string;               // Return type
}
```

## Value Constraints and Validation

### General Constraint System

All types support predicate-based validation through the constraint system:

```typescript
interface ValidationConstraint {
    predicate: (value: any) => boolean;     // Validation function
    message: (value: any, label?: string) => string;  // Error message generator
}

interface TypeMeta {
    // ... existing properties
    constraints?: ValidationConstraint[];    // Custom validation constraints
}
```

**Example Usage:**
```typescript
// Custom validation for Person type
const personType: ObjectTypeMeta = {
    qName: "/company/Person",
    // ... other properties
    constraints: [{
        predicate: (value) => value.male ? value.employed : true,
        message: (v, label) => 'male persons should be employed'
    }]
};
```

### Simple Type Constraints

#### Number Type Constraints

**Range Constraints:**
- `inRange(start, end)` - Value within specified range
- `greaterThan(x)` - Value greater than x
- `greaterThanOrEqual(x)` - Value greater than or equal to x
- `lessThan(x)` - Value less than x
- `lessThanOrEqual(x)` - Value less than or equal to x

**Type Constraints:**
- `integer` - Must be an integer
- `finite` - Must be finite
- `positive` - Must be positive (> 0)
- `negative` - Must be negative (< 0)

**Specialized Integer Types:**
- `uint8` - Unsigned 8-bit integer (0-255)
- `uint16` - Unsigned 16-bit integer (0-65535)
- `uint32` - Unsigned 32-bit integer (0-4294967295)
- `int8` - Signed 8-bit integer (-128 to 127)
- `int16` - Signed 16-bit integer (-32768 to 32767)
- `int32` - Signed 32-bit integer (-2147483648 to 2147483647)

**Equality Constraint:**
- `equal(expected)` - Must equal specific value

#### String Type Constraints

**Length Constraints:**
- `length(length)` - Exact string length
- `minLength(length)` - Minimum string length
- `maxLength(length)` - Maximum string length

**Content Constraints:**
- `matches(regExp)` - Must match regex pattern
- `startsWith(searchString)` - Must start with specific value
- `endsWith(searchString)` - Must end with specific value
- `includes(searchString)` - Must contain specific value
- `oneOf(list)` - Must be one of provided values

**State Constraints:**
- `empty` - Must be empty string
- `nonEmpty` - Must not be empty string
- `equals(expected)` - Must equal specific value

**Format Constraints:**
- `alphanumeric` - Only alphanumeric characters
- `alphabetical` - Only alphabetical characters
- `numeric` - Only numeric characters
- `lowercase` - Must be lowercase
- `uppercase` - Must be uppercase
- `email` - Must be valid email address
- `word` - Must be proper word (letters only)

### Derived Types

The registry supports type derivation for creating constrained versions of existing types:

```typescript
interface DerivedTypeMeta extends TypeMeta {
    derivedFrom: string;             // Reference to base type
    constraints: ValidationConstraint[]; // Additional constraints
}
```

**Example Usage:**
```typescript
// Derived from base number type with constraints
const ID = {
    qName: "/company/IDType",
    derivedFrom: "/base/number",
    constraints: [
        { predicate: (v) => v > 0, message: "ID must be positive" },
        { predicate: (v) => Number.isInteger(v), message: "ID must be integer" }
    ]
};

// Derived from base string type with constraints
const Name = {
    qName: "/company/NameType",
    derivedFrom: "/base/string",
    constraints: [
        { predicate: (v) => /^[a-zA-Z0-9]+$/.test(v), message: "Name must be alphanumeric" },
        { predicate: (v) => v.length <= 128, message: "Name must be max 128 characters" }
    ]
};

// Complex derived type with multiple constraints
const Age = {
    qName: "/company/AgeType",
    derivedFrom: "/base/number",
    constraints: [
        { predicate: (v) => Number.isInteger(v), message: "Age must be integer" },
        { predicate: (v) => v > 0, message: "Age must be positive" },
        { predicate: (v) => v >= 1 && v <= 120, message: "Age must be between 1 and 120" }
    ]
};
```

### Constraint Composition

Constraints can be chained and composed:

```typescript
// Multiple constraints on single type
const complexNumber = {
    qName: "/math/PositiveInteger",
    derivedFrom: "/base/number",
    constraints: [
        { predicate: (v) => v > 0, message: "Must be positive" },
        { predicate: (v) => Number.isInteger(v), message: "Must be integer" },
        { predicate: (v) => v >= 1 && v <= 255, message: "Must be in range 1-255" }
    ]
};

// String with multiple format constraints
const email = {
    qName: "/user/EmailType",
    derivedFrom: "/base/string",
    constraints: [
        { predicate: (v) => v.length > 0, message: "Email cannot be empty" },
        { predicate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Must be valid email format" }
    ]
};
```

## Import/Export System

### Import Syntax
Namespaces can import types from other namespaces using three formats:

1. **Specific Import**: Import named types
   ```typescript
   imports: new Map([
       ["/base", ["User", "Product"]]
   ])
   ```

2. **Wildcard Import**: Import all exported types
   ```typescript
   imports: new Map([
       ["/base", ["*"]]
   ])
   ```

3. **Aliased Import**: Import with different local name
   ```typescript
   imports: new Map([
       ["/base", [{ original: "User", alias: "BaseUser" }]]
   ])
   ```

4. **Mixed Import**: Combination of all formats
   ```typescript
   imports: new Map([
       ["/base", ["*", "SpecificType", { original: "User", alias: "BaseUser" }]]
   ])
   ```

### Export System
Namespaces explicitly declare which types are available for import:

```typescript
exports: ["User", "Product", "Order"]
```

Only exported types can be imported by other namespaces.

## Bidirectional Relationships

The registry supports automatic bidirectional relationship management:

### Forward Relationship
```typescript
// User has many Posts
const userType: ObjectTypeMeta = {
    properties: new Map([
        ["posts", {
            name: "posts",
            typeRef: "/blog/PostArray",
            optional: false,
            inverseProp: "author",
            inverseTypeRef: "/blog/Post"
        }]
    ])
};
```

### Inverse Relationship Metadata
```typescript
inverseCollection: new Map([
    ["posts", {
        propName: "author",
        targetTypeQName: "/blog/Post",
        isCollection: true
    }]
])
```

## Validation Rules

### Namespace Validation
- ✅ Namespace qualified names must be unique
- ✅ Parent namespaces must exist before children
- ✅ Import dependencies must be satisfied
- ✅ No circular import dependencies

### Type Validation
- ✅ Type qualified names must be unique within registry
- ✅ Property type references must exist
- ✅ Property optional flag is required
- ✅ Identity keys must exist as properties (entities)
- ✅ Inheritance chains must be valid
- ✅ Bidirectional relationships must be consistent

### Import/Export Validation
- ✅ Imported namespaces must exist
- ✅ Imported types must be exported by source namespace
- ✅ Aliased imports must not conflict with existing names
- ✅ Wildcard imports respect export restrictions

## Performance Optimizations

### Resolved Types Map
Each namespace maintains an internal `resolvedTypes` map that contains:
- All local types
- All imported types (resolved to actual TypeMeta objects)
- Aliased types under their local names

This enables O(1) type lookup within a namespace context.

### Type Index
The registry maintains a global type index for fast qualified name lookups:
- `Map<string, TypeMeta>` indexed by qualified name
- Automatically updated when namespaces are added/removed

### Lazy Loading
- Type resolution is performed at import time, not at access time
- Validation is done once during import, not on every access
- Circular dependency detection is cached

## Advanced Features

### Inheritance
Objects and entities can extend other types:
```typescript
const adminUserType: ObjectTypeMeta = {
    qName: "/company/users/AdminUser",
    extends: "/company/users/User",
    properties: new Map([
        ["permissions", { name: "permissions", typeRef: "/security/PermissionSet", optional: false }]
    ])
};
```

### Generic Types (Future)
Support for parameterized types:
```typescript
// Array<T>, Map<K,V>, Optional<T>
```

### Constraints (Future)
Type constraints and validation rules:
```typescript
// String length constraints, numeric ranges, custom validators
```

## Usage Examples

### Basic Type Definition
```typescript
const userType: ObjectTypeMeta = {
    qName: "/company/users/User",
    category: "complex",
    kind: "entity",
    properties: new Map([
        ["id", { name: "id", typeRef: "/base/string", optional: false }],
        ["name", { name: "name", typeRef: "/base/string", optional: false }],
        ["email", { name: "email", typeRef: "/base/string", optional: true }]
    ]),
    identityKeys: ["id"]
};
```

### Namespace with Imports
```typescript
const userNamespace: Namespace = {
    qName: "/company/users",
    types: new Map([["User", userType]]),
    exports: ["User"],
    imports: new Map([
        ["/base", ["string", "number"]],
        ["/security", [{ original: "Permission", alias: "UserPermission" }]]
    ])
};
```

### Registry Usage
```typescript
const registry = new RegistryService();

// Import namespace
const result = registry.importNamespace(userNamespace);
if (result.isValid) {
    // Fast type lookup
    const user = registry.getType("/company/users/User");
    
    // Available types in namespace
    const availableTypes = registry.getAvailableTypesInNamespace("/company/users");
}
```

## Migration from Old Schema System

### Key Differences
1. **Namespace-based** vs Schema-based organization
2. **Qualified names** vs Local names with schema context
3. **Enhanced type system** with more categories
4. **Improved validation** with better error handling
5. **Performance optimizations** with resolved types

### Migration Strategy
1. Convert schemas to namespaces
2. Update type references to qualified names
3. Convert import/export format
4. Update validation logic
5. Add identity keys to entities
6. Migrate tests and documentation

## Error Handling

### Import Errors
- Missing namespace dependencies
- Type not exported by source namespace
- Circular import dependencies
- Conflicting type aliases

### Validation Errors
- Missing required properties
- Invalid type references
- Inconsistent bidirectional relationships
- Invalid identity keys

### Runtime Errors
- Type not found
- Namespace not found
- Invalid qualified names
- Access to non-exported types

## Best Practices

### Namespace Organization
- Use hierarchical structure: `/company/domain/subdomain`
- Keep namespaces focused and cohesive
- Export only public API types
- Use descriptive namespace names

### Type Design
- Prefer composition over inheritance
- Use entities for data with identity
- Define clear bidirectional relationships
- Include proper validation constraints

### Import Management
- Import specific types when possible
- Use aliases to avoid naming conflicts
- Avoid deep import chains
- Document import dependencies

## Future Enhancements

### Planned Features
- Generic type parameters
- Type constraints and validation
- Versioning and compatibility
- Distributed registry support
- Schema migration tools

### Performance Improvements
- Lazy loading of large namespaces
- Incremental validation
- Caching of resolved types
- Optimized serialization

This type system provides a robust foundation for complex type management while maintaining performance and developer productivity.