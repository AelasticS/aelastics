# AI Agent Implementation Plan: StoreClass Restoration

## Overview
This plan details the steps to restore missing functionality in `StoreClass.ts` by integrating comprehensive logic from the old working version. The current implementation is missing ~60% of original functionality, particularly in object management, serialization, and immutable conversion.

## Architecture Context
- **Interface Pattern**: `IStore` → Interface Adapters → `StoreClass` 
- **Key Interfaces**: `IObjects`, `IHistory`, `IData`, `IEvents`
- **Adapter Classes**: `ObjectsAdapter`, `HistoryAdapter`, `DataAdapter`, `EventsAdapter`
- **Files to Modify**: 
  - Primary: `src/store/StoreClass.ts`
  - Secondary: `src/store/InterfaceAdapters.ts`

## Current Issues

### Critical Missing Methods in StoreClass
1. **`delete<T>(obj: T): void`** - Referenced in `ObjectsAdapter:26` but missing
2. **Comprehensive `import<T>(obj: T, type?: string): T`** - Current implementation too basic
3. **Comprehensive `export<T>(storeObject: T): any`** - Current implementation too basic
4. **Robust `serialize/deserialize`** - Current implementations lack cyclic reference handling

### Interface Adapter TODOs
- `ObjectsAdapter:26` - delete functionality 
- `ObjectsAdapter:54,59` - import/export functionality
- Multiple adapters have placeholder implementations

## Implementation Steps

### Step 1: Add Missing Core StoreClass Methods (High Priority)

#### 1.1 Add `delete` Method
```typescript
// Add to StoreClass.ts around line 570 (after export method)
public delete<T extends object>(obj: T): void {
  if (!(obj instanceof __StoreSuperClass__)) {
    throw new Error("The provided object is not a valid store object.")
  }
  const objUUID = (obj as any)[uuid]
  const currentState = this.getState()
  currentState.deleteObject(objUUID)
}
```

#### 1.2 Add Enhanced Object Retrieval 
```typescript
// Add to StoreClass.ts around line 720 (after findByUUID)
public get<T extends object>(obj: string | T, stateIndex?: number): T | undefined {
  if (stateIndex !== undefined) {
    return this.fromState<T>(stateIndex, obj)
  } else {
    if (typeof obj === "string") {
      return this.findByUUID<T>(obj)
    } else if (obj instanceof __StoreSuperClass__) {
      const uuidValue = (obj as any)[uuid]
      return this.findByUUID<T>(uuidValue)
    }
  }
  return undefined
}
```

### Step 2: Replace Import/Export with Comprehensive Logic (High Priority)

#### 2.1 Replace `import` Method
**Current location**: `StoreClass.ts:542-569`
**Action**: Replace entire method with old `toImmutable` logic from reference file
**Key features to restore**:
- Cyclic reference handling with `processed` Map
- `@AelasticsType` and `@AelasticsUUID` property handling  
- Recursive property initialization for arrays, maps, sets, objects
- Private property key handling with `makePrivatePropertyKey`
- Transaction management with update mode

#### 2.2 Replace `export` Method  
**Current location**: `StoreClass.ts:571-583`
**Action**: Replace entire method with old `fromImmutable` logic from reference file
**Key features to restore**:
- Cyclic reference handling with `processed` Map
- Metadata property addition (`@AelasticsType`, `@AelasticsUUID`, `@AelasticsCreatedAt`)
- Recursive collection export (arrays, maps, sets)
- Property metadata traversal with `getAllProperties`

### Step 3: Enhanced Serialization Methods (High Priority)

#### 3.1 Replace `serialize` Method
**Current location**: `StoreClass.ts:612-631`
**Action**: Replace with comprehensive version from old code
**Key features to restore**:
- Object graph serialization with UUID references
- Cyclic reference prevention
- Collection handling (arrays as UUID arrays, maps as key-value UUID pairs)
- Recursive object traversal

#### 3.2 Replace `deserialize` Method
**Current location**: `StoreClass.ts:585-610` 
**Action**: Replace with comprehensive version from old code
**Key features to restore**:
- Object graph reconstruction
- UUID resolution and validation
- Proper object instantiation using dynamic classes
- Private property population
- Reference resolution validation

### Step 4: Add Missing Helper Methods (Medium Priority)

#### 4.1 Add `ensureStoreObject` Helper
```typescript
// Add as private method in StoreClass
private ensureStoreObject(value: any, type?: string, processed: Map<any, any> = new Map()): any {
  // Implementation from old code - handles mixed object types and prevents infinite recursion
}
```

#### 4.2 Enhance `getAllProperties` Method
**Current location**: `StoreClass.ts:679-687`
**Action**: Replace with inheritance-aware version from old code
**Key features to restore**:
- Recursive property collection from supertypes
- Proper inheritance handling with `typeMeta.extends`
- Property override support

### Step 5: Fix Interface Adapters (Medium Priority)

#### 5.1 Complete ObjectsAdapter Methods
**File**: `src/store/InterfaceAdapters.ts`
**Lines to fix**: 26, 54, 59

```typescript
// Line 26 - Replace TODO with:
delete<T>(obj: T): void {
  this.store.delete(obj);
}

// Line 54 - Replace TODO with:
import<T>(plainObject: any, qualifiedNameOrTypeMeta: string | TypeMeta): T {
  const type = typeof qualifiedNameOrTypeMeta === 'string' 
    ? qualifiedNameOrTypeMeta 
    : qualifiedNameOrTypeMeta.qName;
  return this.store.import<T>(plainObject, type);
}

// Line 59 - Replace TODO with:  
export<T>(storeObject: T): any {
  return this.store.export<T>(storeObject);
}
```

#### 5.2 Enhance DataAdapter
**File**: `src/store/InterfaceAdapters.ts` 
**Action**: Remove basic implementations, use enhanced StoreClass methods

### Step 6: Add Missing Dynamic Class Features (Low Priority)

#### 6.1 Add `addCopyPropsMethod` Integration
**Note**: May need to implement missing import: `addCopyPropsMethod`
**Location**: Dynamic class creation in StoreClass

#### 6.2 Add Inheritance Support
**Current location**: `createDynamicClass` method
**Action**: Add superclass handling from old code

## Testing Strategy

### After Each Step:
1. Run existing tests: `heft test` from package directory
2. Check interface adapter functionality
3. Verify basic object operations (create, find, update)

### Critical Test Cases:
1. Object deletion and reference cleanup
2. Complex object graph serialization/deserialization  
3. Cyclic reference handling in import/export
4. State management and undo/redo operations

## Validation Checklist

- [ ] `delete` method properly removes objects and handles references
- [ ] `import` method handles complex object graphs with cyclic references
- [ ] `export` method preserves all object relationships and metadata
- [ ] `serialize/deserialize` maintains object graph integrity
- [ ] All interface adapter TODOs are resolved
- [ ] Existing tests still pass
- [ ] No breaking changes to public API

## Risk Mitigation

1. **Backup**: Old working code preserved in `StoreClass-old-working-version.txt`
2. **Incremental**: Implement one step at a time, test after each
3. **Rollback**: Each step can be individually reverted if issues arise
4. **Compatibility**: Maintain current method signatures for interface compatibility

## Notes for AI Agent

- Reference the old working code in `StoreClass-old-working-version.txt` for implementation details
- Preserve existing method signatures to maintain interface compatibility
- Pay special attention to `uuid`, `createdAt`, and other symbol-based properties
- Ensure proper error handling and transaction management in all restored methods
- The current registry system uses different type metadata structure - adapt accordingly