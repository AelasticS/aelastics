# COMPLETE OPERATIONAL PLAN: Bidirectional Relationships & Simple Property Inverse Validation

This document outlines the complete plan for both the bidirectional Map relationships we were working on AND the new requirement to forbid simple properties as inverse.

## Phase 1: Validation Rules for Inverse Relationships (Planned)

## Overview

This phase implements strict validation rules to prevent problematic inverse relationship patterns that violate data normalization principles.

## What We're Preventing

### 1. Simple Property Inverses (FORBIDDEN)

**Problem**: Simple properties (string, number, boolean) with inverse relationships create duplicate, denormalized data.

**Example of what's NOT allowed**:

```typescript
// ❌ BAD: Creates redundant data
Employee.name: string ↔ Department.managerName: string
```

**Why it's bad**: The same name appears in two places, violating normalization.

### 2. Map KEY-based Inverse Relationships (FORBIDDEN)

**Problem**: When a Map's key is an entity with inverse relationships, it creates redundant access patterns.

**Example of what's NOT allowed**:

```typescript
// ❌ BAD: KEY-based inverse pattern
Department.employeeMap: Map<Employee, string> ↔ Employee.assignedDepartment: Department
```

**Why it's bad**: You can already access `Employee.assignedDepartment` directly from the Employee key, making the inverse redundant.

### 3. Map Simple Value Inverses (ALSO FORBIDDEN)

**Problem**: Maps with simple value types having inverse relationships create denormalized data.

**Example of what's NOT allowed**:

```typescript
// ❌ BAD: Creates duplicate data (same grade in both Maps)
Student.courseGrades: Map<Course, number> ↔ Course.studentGrades: Map<Student, number>
```

**Why it's bad**: The same grade value (e.g., 95) appears in both Maps, violating normalization.

### 4. What IS Allowed: Valid Map Inverse Patterns ✅

**Valid pattern**: Map with simple keys and entity values, with inverse to entity property or entity collection.

**Examples of what's allowed**:

```typescript
// ✅ GOOD: Map<SimpleKey, EntityValue> ↔ EntityValue.entityProperty
Department.employeesByRole: Map<string, Employee> ↔ Employee.department: Department

// ✅ GOOD: Map<SimpleKey, EntityValue> ↔ EntityValue.entityCollection  
Department.employeesByRole: Map<string, Employee> ↔ Employee.departments: Set<Department>
```

**Why it's good**: Entity relationships are properly normalized - no simple property inverses, Map values are entities.

## Implementation Tasks

### Task 1.1: Type Detection Helper

**File**: `src/registry/TypeDefinitions.ts`
**Goal**: Create utility to identify simple property types

* Add `isSimplePropertyType()` function
* Detect 'string', 'number', 'boolean' types
* Distinguish from entity/object types

### Task 1.2: Namespace Import Validation

**File**: `src/registry/InternalNamespace.ts`
**Location**: `deriveInverseTypeOptimizations()` method (around line 270)
**Goal**: Prevent importing namespaces with invalid inverse patterns

**Validation Rules**:

1. **Simple Property Check**: If property is simple type AND has inverse → Error
2. **Map Pattern Validation**:
   * Only VALUE-based inverses allowed where value type is entity
   * KEY-based patterns → Error
   * Simple value types with inverses → Error (like the educational namespace pattern)

**Error Messages**:

* `"Simple properties (string, number, boolean) cannot have inverse relationships"`
* `"Map KEY-based inverse relationships are not allowed. Only Map VALUE-based inverses are valid"`
* `"Map inverse relationships require entity VALUE type. Simple value types cannot have inverses"`
* `"Educational namespace pattern 'Student.courseGrades ↔ Course.studentGrades' is denormalized and not allowed"`

### Task 1.3: Runtime Property Validation

**File**: `src/store/PropertyAccessors.ts`  
**Location**: `createPropertyAccessors()` function (lines 360-450)
**Goal**: Add runtime checks during property accessor setup

* Validate before setting up inverse updaters
* Reject simple properties with inverse relationships at runtime

### Task 1.4: Comprehensive Test Coverage

**File**: `src/__tests__/simple-property-inverse-validation.test.ts`
**Goal**: Ensure validation works correctly using real problematic examples

**Test Cases**:

* Simple properties (string, number, boolean) with inverses → Should throw validation errors
* Entity/object properties with inverses → Should work normally  
* Educational namespace pattern (`Student.courseGrades ↔ Course.studentGrades`) → Should be rejected as denormalized
* Both import-time and runtime validation scenarios

// =============================================================================
// PHASE 3: ARCHITECTURAL CLEANUP (UPCOMING)
// =============================================================================

```ts
const PHASE3_TASKS = {
    "3.1_REMOVE_DENORMALIZED_PATTERNS": {
        objective: "Replace denormalized educational namespace with proper normalized patterns",
        details: [
            "Remove Student.courseGrades ↔ Course.studentGrades (denormalized pattern)",
            "Replace with normalized StudentCourseEnrollment junction entity",
            "Update educational namespace to use proper many-to-many relationships",
            "Document why the old pattern violated normalization principles"
        ]
    },
    
    "3.2_ADD_JUNCTION_ENTITY_EXAMPLES": {
        objective: "Provide proper many-to-many relationship examples",
        details: [
            "Create example namespace with StudentCourseEnrollment junction entity",
            "Show proper normalized many-to-many with additional data",
            "Document best practices for relationship modeling"
        ]
    }
};
```

// =============================================================================
// UPDATED EXECUTION ORDER (ONLY REMAINING WORK)
// =============================================================================

```ts
const EXECUTION_PLAN = {
    sequence: [
        "1. Tactical: Event change log normalization (duplicate array add filtering)",
        "2. Tactical: Reverse-side symmetry duplicate tests (array ordered-set)",
        "3. Docs: Ordered-set semantics + setByIndex duplicate error section",
        "4. Phase 1: Validation implementation (simple property + invalid Map inverses)",
        "5. Phase 3: Architectural cleanup (remove denormalized pattern, add junction examples)",
        "6. Coverage: Edge inverseUpdaters branches + residual gaps",
        "7. Optional: Micro-benchmark (post-validation)"
    ]
};
```

// =============================================================================
// VALIDATION IMPLEMENTATION DETAILS
// =============================================================================

```ts
const VALIDATION_STRATEGY = {
    location: "InternalNamespace.deriveInverseTypeOptimizations()",
    logic: `
        // For each property with inverse relationship
        if (propertyMeta.inverseTypeRef && propertyMeta.inverseProp) {
            // Check if the property itself is a simple type
            if (isSimpleType(propertyMeta.typeRef)) {
                errors.push(
                    \`Simple property '\${propName}' of type '\${propertyMeta.typeRef}' cannot have inverse relationship. \` +
                    \`Inverse relationships are only allowed for entity/object properties and collections.\`
                );
                continue; // Skip further processing for this property
            }
            // ... rest of existing inverse validation logic
        }
    `,
    
    helper_function: `
        function isSimpleType(typeRef: string): boolean {
            return typeRef === 'string' || typeRef === 'number' || typeRef === 'boolean';
        }
    `,
    
    error_message_examples: [
        "Simple property 'name' of type 'string' cannot have inverse relationship.",
        "Simple property 'salary' of type 'number' cannot have inverse relationship.", 
        "Simple property 'isActive' of type 'boolean' cannot have inverse relationship."
    ]
};
```

```ts
const PHASE1_TASKS = {
    "1.1_TYPE_DETECTION_HELPER": "Implement isSimplePropertyType() in TypeDefinitions.ts",
    "1.2_NAMESPACE_IMPORT_VALIDATION": "Enforce invalid inverse rejection in InternalNamespace.deriveInverseTypeOptimizations()",
    "1.3_RUNTIME_PROPERTY_VALIDATION": "Add runtime guard in createPropertyAccessors() before wiring updaters",
    "1.4_VALIDATION_TEST_COVERAGE": "Add comprehensive rejection/acceptance tests in simple-property-inverse-validation.test.ts"
};

export { PHASE1_TASKS, PHASE3_TASKS, EXECUTION_PLAN, VALIDATION_STRATEGY };
```

// =============================================================================
// PROGRESS UPDATE  
// =============================================================================

## Current Focus (2025-08-10)

* Event change log normalization (remove ghost duplicate add entries)
* Symmetry duplicate tests for reverse sides of array relationships
* Documentation addition: ordered-set semantics + error behavior (setByIndex duplicate)
* Phase 1 validation implementation
* Phase 3 architectural cleanup (junction entity, remove denormalized pattern)
* Coverage improvements for inverseUpdaters edge branches

## Execution Sequence (Remaining Only)

1. Event change log normalization
2. Reverse-side symmetry duplicate tests
3. Ordered-set semantics documentation update
4. Phase 1 validation implementation
5. Phase 3 architectural cleanup
6. Coverage edge cases & inverseUpdaters branches
7. Optional micro-benchmark

## QUICK STATUS MATRIX

| Area | Status | Notes |
|------|--------|-------|
| Event change log filtering | ⏳ | Duplicates still appear (to normalize) |
| Reverse-side array duplicate tests | ⏳ | Not added yet |
| Simple property inverse validation (Phase 1) | ⏳ | Not started |
| Map invalid pattern validation (Phase 1) | ⏳ | Not started |
| Docs (ordered-set semantics) | ⏳ | Pending addition |
| Coverage edge branches (inverseUpdaters) | ⏳ | Planned |
| Phase 3 cleanup (junction entity) | ⏳ | Planned |

### Notes

Completed phases (previously detailed) removed for brevity; refer to repository history if historical implementation specifics are needed.

