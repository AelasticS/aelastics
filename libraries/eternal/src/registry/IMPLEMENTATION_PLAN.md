# Registry Type System Implementation Plan

## Overview
This document outlines the step-by-step implementation plan to enhance the current registry system with all features described in the TYPE_SYSTEM.md specification.

## Current State Analysis

### ✅ Already Implemented
- Basic namespace structure with qualified names
- Import/export system (basic string array format)
- Type validation framework
- Property metadata with optional flags
- Identity keys for entities
- Bidirectional relationship metadata
- Basic type categories (simple, complex, special)

### 🔄 Partially Implemented
- Import system (missing wildcards and aliasing)
- Type lookup (runtime resolution, needs optimization)
- Validation (missing circular dependency detection)

### ❌ Missing Features
- Enhanced import format (wildcards, aliasing)
- Resolved types optimization
- Circular import detection
- InternalNamespace class
- Performance optimizations
- Advanced type system features

## Implementation Steps

### Step 1: Update Import System Foundation
**Status**: In Progress
**Files**: `src/registry/NamespaceMetadata.ts`

#### Tasks:
- [x] ✅ Define `ImportEntry` type for wildcards and aliases
- [x] ✅ Update `Namespace` interface to use `ImportEntry[]`
- [x] ✅ Update `getAvailableTypes` function for new format
- [x] ✅ Update `resolveTypeReference` function for new format

#### Next:
- [ ] Fix any remaining TypeScript errors
- [ ] Update existing tests to use new import format

### Step 2: Implement InternalNamespace Class
**Status**: Not Started
**Files**: `src/registry/InternalNamespace.ts` (new file)

#### Tasks:
- [ ] Create `InternalNamespace` class implementing `Namespace` interface
- [ ] Add private `resolvedTypes` map
- [ ] Implement `computeResolvedTypes()` method based on existing `computeResolvedTypes` logic
- [ ] Add wildcard import support (`"*"` handling)
- [ ] Add aliasing support (`{ original, alias }` handling)
- [ ] Implement `getResolvedType()` method for fast lookups
- [ ] Implement `getAvailableTypeNames()` method
- [ ] Add validation for import conflicts and duplicates

#### Implementation Details:
```typescript
class InternalNamespace implements Namespace {
    private resolvedTypes: Map<string, TypeMeta> = new Map();
    
    computeResolvedTypes(registry: RegistryMetadata): string[] {
        // 1. Start with local types
        // 2. Process wildcard imports
        // 3. Process specific imports  
        // 4. Process aliased imports
        // 5. Validate exports
        // 6. Return errors
    }
}
```

### Step 3: Add Circular Import Detection
**Status**: Not Started
**Files**: `src/registry/InternalNamespace.ts`

#### Tasks:
- [ ] Implement `detectCircularImports()` method
- [ ] Use depth-first search with visited set
- [ ] Track import chains for error reporting
- [ ] Handle self-imports and deep cycles

#### Implementation Details:
```typescript
detectCircularImports(registry: RegistryMetadata, visited: Set<string> = new Set()): string[] {
    // Based on existing detectCircularDependency logic
}
```

### Step 4: Enhance RegistryService
**Status**: Partially Started
**Files**: `src/registry/RegistryService.ts`

#### Tasks:
- [ ] Add `internalNamespaces` map to store InternalNamespace instances
- [ ] Update `importNamespace()` to use InternalNamespace
- [ ] Integrate resolved types computation
- [ ] Add circular import detection to validation
- [ ] Replace runtime type resolution with pre-computed lookups
- [ ] Update `getTypeInNamespace()` to use resolved types
- [ ] Update `getAvailableTypesInNamespace()` to use resolved types
- [ ] Ensure atomic operations (success/failure)

#### Implementation Details:
```typescript
export class RegistryService {
    private internalNamespaces: Map<string, InternalNamespace> = new Map();
    
    public importNamespace(namespace: Namespace): ValidationResult {
        const internal = new InternalNamespace(namespace);
        const resolveErrors = internal.computeResolvedTypes(this.registry);
        const circularErrors = internal.detectCircularImports(this.registry);
        // ... combine all validation
    }
}
```

### Step 5: Update Validation System
**Status**: Partially Implemented
**Files**: `src/registry/RegistryService.ts`

#### Tasks:
- [ ] Integrate resolved types into property validation
- [ ] Add circular inheritance detection
- [ ] Enhance import/export validation
- [ ] Add alias conflict detection
- [ ] Improve error messages with import context

### Step 6: Update Tests
**Status**: Not Started
**Files**: `src/__tests__/new-registry-tests/*.test.ts`

#### Tasks:
- [ ] Update existing tests to use new import format
- [ ] Add tests for wildcard imports
- [ ] Add tests for aliased imports
- [ ] Add tests for circular import detection
- [ ] Add tests for resolved types optimization
- [ ] Add performance tests for large namespaces

#### Test Examples:
```typescript
describe("Enhanced Import System", () => {
    test("should support wildcard imports", () => {
        const namespace: Namespace = {
            imports: new Map([
                ["/base", ["*"]]
            ])
        };
        // Test all exported types are available
    });
    
    test("should support aliased imports", () => {
        const namespace: Namespace = {
            imports: new Map([
                ["/base", [{ original: "User", alias: "BaseUser" }]]
            ])
        };
        // Test type is available under alias
    });
});
```

### Step 7: Add Enhanced Type System Features
**Status**: Not Started
**Files**: `src/registry/TypeDefinitions.ts`

#### Tasks:
- [ ] Add tagged union type support with discriminator
- [ ] Move objectRef from special to complex types
- [ ] Add comprehensive constraint system to all types
- [ ] Implement derived types with constraint inheritance
- [ ] Add validation constraint interface
- [ ] Implement function type metadata
- [ ] Add intersection type support
- [ ] Add tuple type support
- [ ] Add subtype constraints
- [ ] Enhance inheritance validation

#### New Type System Features:
```typescript
// Tagged unions with discriminator
interface TaggedUnionTypeMeta {
    discriminator: string;
    unionTypes: TaggedUnionMember[];
}

// Constraint system for all types
interface ValidationConstraint {
    predicate: (value: any) => boolean;
    message: (value: any, label?: string) => string;
}

// Derived types with constraint inheritance
interface DerivedTypeMeta extends TypeMeta {
    derivedFrom: string;
    constraints: ValidationConstraint[];
}
```

### Step 8: Performance Optimizations
**Status**: Not Started
**Files**: Multiple

#### Tasks:
- [ ] Profile current performance
- [ ] Optimize type index updates
- [ ] Add lazy loading for large namespaces
- [ ] Implement incremental validation
- [ ] Add caching for frequently accessed types

### Step 9: Documentation and Migration
**Status**: Not Started
**Files**: Documentation and examples

#### Tasks:
- [ ] Update API documentation
- [ ] Create migration guide from old schema system
- [ ] Add usage examples
- [ ] Update README with new features
- [ ] Create performance benchmarks

## Implementation Order

### Phase 1: Core Infrastructure (Steps 1-3)
**Priority**: High
**Estimated Time**: 2-3 days

Focus on getting the basic enhanced import system working with resolved types optimization.

### Phase 2: Integration (Steps 4-5)
**Priority**: High  
**Estimated Time**: 2-3 days

Integrate new features into RegistryService and enhance validation.

### Phase 3: Testing and Validation (Step 6)
**Priority**: High
**Estimated Time**: 1-2 days

Ensure all features work correctly and don't break existing functionality.

### Phase 4: Advanced Features (Steps 7-9)
**Priority**: Medium
**Estimated Time**: 3-4 days

Add advanced type system features and optimizations.

## Risk Assessment

### High Risk
- **Breaking Changes**: New import format may break existing code
- **Performance Impact**: Resolved types computation may slow down imports
- **Complexity**: Circular dependency detection can be complex to implement correctly

### Medium Risk
- **Memory Usage**: Resolved types maps may increase memory usage
- **Validation Complexity**: Enhanced validation may have edge cases

### Low Risk
- **API Changes**: Most changes are internal optimizations
- **Test Coverage**: Existing tests should catch most regressions

## Success Criteria

### Functional Requirements
- [x] ✅ All existing tests pass
- [ ] New import format works (wildcards, aliases)
- [ ] Circular import detection prevents infinite loops
- [ ] Resolved types provide performance improvement
- [ ] Validation is comprehensive and accurate

### Performance Requirements
- [ ] Type lookup should be O(1) within namespace
- [ ] Import processing should be linear with number of imports
- [ ] Memory usage should be reasonable for large namespaces

### Quality Requirements
- [ ] Code coverage > 90%
- [ ] No TypeScript errors
- [ ] Clear error messages for validation failures
- [ ] Comprehensive documentation

## Next Steps

1. **Confirm this plan** - Review and approve the implementation approach
2. **Start Step 2** - Implement InternalNamespace class
3. **Regular check-ins** - Review progress after each step
4. **Incremental testing** - Test each step before moving to next
5. **Documentation updates** - Keep docs current with implementation

## Questions for Confirmation

1. **Should we implement all steps or focus on core features first?**
2. **Are there any specific performance requirements?**
3. **Should we maintain backward compatibility with old import format?**
4. **Any specific TypeScript version requirements?**
5. **Should we add any additional type system features beyond the specification?**

This plan provides a structured approach to implementing the enhanced registry type system while minimizing risk and ensuring quality.