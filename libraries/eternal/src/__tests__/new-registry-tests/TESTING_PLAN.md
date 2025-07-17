# Registry Namespace Import Testing Plan

## Overview
This testing plan covers systematic testing of all namespace import features in the eternal type system. Tests will validate both successful imports and error handling.

## Error Handling Structure
- `NamespaceImportError` extends `Error` 
- Contains `validationResult: ValidationResult` property
- `ValidationResult` has:
  - `isValid: boolean`
  - `errors: string[]` - Array of error messages
  - `warnings?: string[]` - Optional array of warnings

## Test Categories

### 1. Basic Namespace Import Tests (`basic-import.test.ts`)
- ✅ Import valid namespace with simple types
- ✅ Import namespace with object types
- ✅ Import namespace with entity types
- ✅ Verify type accessibility after import
- ✅ Verify type index is updated correctly

### 2. System Namespace Auto-Import Tests (`system-namespace.test.ts`)
- ✅ Verify system namespace is present in new registry
- ✅ Verify system namespace is auto-imported when importing other namespaces
- ✅ Verify system types are accessible by simple name
- ✅ Test prevention of redefining system types
- ✅ Test prevention of using reserved 'system' namespace name

### 3. Collection Type Tests (`collection-types.test.ts`)
- ✅ Import namespaces with ArrayTypeMeta
- ✅ Import namespaces with SetTypeMeta  
- ✅ Import namespaces with MapTypeMeta
- ✅ Import namespaces with RecordTypeMeta
- ✅ Verify collection element type resolution

### 4. Bidirectional Relationship Tests (`bidirectional-relationships.test.ts`)
- ✅ One-to-One relationships (Employee ↔ Badge)
- ✅ One-to-Many relationships (Company ↔ Employees)
- ✅ Many-to-Many relationships (Student ↔ Courses)
- ✅ Verify inverse relationship metadata
- ✅ Test bidirectional consistency validation

### 5. Inheritance Tests (`inheritance.test.ts`)
- ✅ Import namespace with ObjectTypeMeta inheritance (extends)
- ✅ Multiple levels of inheritance
- ✅ Verify base type resolution
- ✅ Test invalid inheritance (non-object base types)
- ✅ Test circular inheritance detection

### 6. Subtype Tests (`subtype.test.ts`)
- ✅ Import namespace with SubtypeTypeMeta
- ✅ Verify base type resolution for subtypes
- ✅ Test subtype extra properties
- ✅ Test invalid subtype base types
- ✅ Test circular subtype dependencies

### 7. Import Pattern Tests (`import-patterns.test.ts`)
- ✅ Specific imports: `["/namespace", ["Type1", "Type2"]]`
- ✅ Wildcard imports: `["/namespace", ["*"]]`
- ✅ Aliased imports: `["/namespace", [{ original: "Type", alias: "AliasType" }]]`
- ✅ Mixed imports: `["/namespace", ["*", "SpecificType", { original: "Type", alias: "Alias" }]]`
- ✅ Verify import resolution and type accessibility

### 8. Validation Error Tests (`validation-errors.test.ts`)
- ✅ Invalid qName formats
- ✅ Missing imports (referencing types without importing)
- ✅ Invalid property type references
- ✅ Missing optional flags
- ✅ Invalid identity keys
- ✅ Duplicate namespace names
- ✅ Non-existent imported namespaces
- ✅ Non-exported type imports
- ✅ Circular import dependencies

### 9. Role System Tests (`role-system.test.ts`)
- ✅ Import namespace with role definitions
- ✅ Import namespace with types having roles
- ✅ Verify role metadata is preserved
- ✅ Test role reference validation

### 10. Edge Cases and Complex Scenarios (`edge-cases.test.ts`)
- ✅ Multiple namespace imports in correct order
- ✅ Import order dependencies
- ✅ Large namespaces with many types
- ✅ Mixed valid and invalid type definitions
- ✅ Registry state consistency after failed imports

## Test Structure Pattern
Each test file will follow this pattern:

```typescript
describe("Test Category", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("Valid scenarios", () => {
        test("should successfully import valid namespace", () => {
            // Test successful import
            expect(() => {
                registry.importNamespace(validNamespace);
            }).not.toThrow();
            
            // Verify state after import
            expect(registry.hasNamespace("/namespace")).toBe(true);
            expect(registry.hasType("/namespace/Type")).toBe(true);
        });
    });

    describe("Error scenarios", () => {
        test("should throw NamespaceImportError for invalid namespace", () => {
            expect(() => {
                registry.importNamespace(invalidNamespace);
            }).toThrow(NamespaceImportError);
        });
        
        test("should contain specific error messages", () => {
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Expected error message");
            }
        });
    });
});
```

## Test Data Usage
- Use example namespaces from `../example-namespaces/` for valid scenarios
- Use invalid namespaces from `../example-namespaces/invalid-namespaces/` for error scenarios
- Create additional test-specific namespaces when needed

## Test Execution
All tests must be run with `heft test` command and should pass in the eternal library context.