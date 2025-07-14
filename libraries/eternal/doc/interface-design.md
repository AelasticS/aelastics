# Interface Design Agreement

## Overview

This document defines the final interface design for the Eternal Store library, implementing a clean separation of concerns through focused interfaces while maintaining the powerful capabilities of the current system.

## Main Store Interface

```typescript
interface IStore {
  // Namespace accessors
  get objects(): IObjects     // Object lifecycle management
  get history(): IHistory     // State and time-travel operations  
  get registry(): IRegistry   // Type registry management
  get data(): IData           // JSON serialization operations
  get events(): IEvents       // Event subscription management
  
  // Store-level operations (entire store state)
  import(storeStateJson: string): void    // Import entire store (all objects + history + metadata)
  export(): string                        // Export entire store (all objects + history + metadata)
  
  // Utility methods
  makeEternal<T>(obj: T): T
  makeRegular<T>(obj: T): T
  getEternalStore(): StoreClass   // Access to internal implementation
  validate?<T>(obj: T): Result // validate all objects

}
```

## Objects Interface - Individual Object Management

```typescript
interface IObjects {
  // Object lifecycle
  create<T>(type: string, initialState?: Partial<T>): T
  update<T>(obj: T, recipe: (obj: T) => void): T  
  delete<T>(obj: T): void
  
  // Object retrieval
  find<T>(type: string, predicate?: (obj: T) => boolean, state?: number): T[]
  findByUUID<T>(uuid: string, state?: number): T | undefined
  getUUID<T>(obj: T): string
  
  // Object conversion (plain objects ↔ store objects)
  import<T>(plainObject: any, type?: string): T     // Convert plain object to store object
  export<T>(storeObject: T): any                    // Convert store object to plain object
  
  // Validation
  validate?<T>(obj: T): Result
}
```

## History Interface - State Management & Time Travel

```typescript
interface IHistory {
  // Time travel operations
  undo(): boolean
  redo(): boolean
  
  // State access
  getState(): IState
  getStateByIndex(index: number): IState
  fromState<T>(stateIndex: number, target: string | T): T | undefined
  
  public produce<T>(recipe: (obj: T) => void): IState {

  // Transaction state
  isInUpdateMode(): boolean
  
  // Change tracking
  getAllChanges(option?: "all" | "only_modifications"): ChangeLogEntry[]
  consolidate(): void // consolidateStates
  
  // State introspection
  getCurrentStateIndex(): number
  getStateCount(): number
}
```

## Registry Interface - Type Registry Management

```typescript
interface IRegistry {
  // Namespace management (logical containers)
  getNamespace(name: string): INamespace
  createNamespace(name: string): INamespace
  listNamespaces(): string[]
  hasNamespace(name: string): boolean
  
  // Remote registry operations (like git remotes)
  addRemote(name: string, url: string, auth?: AuthConfig): Promise<void>
  listRemotes(): RemoteConfig[]
  removeRemote(name: string): void
  
  // Sync operations
  sync(remoteName: string, namespaceName?: string): Promise<void>
  pull(remoteName: string, namespaceName: string): Promise<void>
  push(remoteName: string, namespaceName: string): Promise<void>
  cloneNamespace(remoteName: string, namespaceName: string): Promise<void>
  
  // Registry metadata
  getInfo(): RegistryInfo
  persist(): Promise<void>
  load(): Promise<void>
}

interface INamespace {
  readonly name: string
  readonly registry: IRegistry
  
  // Type operations within this namespace
  getType(typeName: string): TypeMeta
  registerType(typeName: string, definition: TypeMeta): void
  hasType(typeName: string): boolean
  removeType(typeName: string): void
  listTypes(): string[]
  
  // Type introspection (scoped to this namespace)
  getProperties(typeName: string): Map<string, PropertyMeta>
  getClass(typeName: string): any
  validateType(typeName: string): Result
  getInheritanceChain(typeName: string): string[]
  
  // Namespace operations
  export(): NamespaceDefinition
  import(definition: NamespaceDefinition): void
}
```

## Data Interface - JSON Serialization

```typescript
interface IData {
  // JSON serialization for individual objects
  serialize<T>(obj: T): string                           // Store object → JSON string
  deserialize<T>(json: string, type: string, validate?: boolean): T   // JSON string → Store object
  
  // Batch operations (future extensions)
  serializeBatch?<T>(objects: T[]): string
  deserializeBatch?<T>(json: string): T[]
}
```

## Events Interface - Event Subscription Management

```typescript
interface IEvents {
  // Event subscriptions
  subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation, 
    objectType: Type,
    property?: Property 
  ): () => void
  
  // Object-specific subscriptions
  subscribeToObject<T>(object: T, listener: (updatedObject: T) => void): () => void
  
  // Store-wide subscriptions  
  subscribeToStore(listener: () => void): () => void
}
```

## Usage Examples

### Object Operations
```typescript
// Create and manage objects
const user = store.objects.create('User', { name: 'John' })
store.objects.update(user, u => u.name = 'Jane')
store.objects.delete(user)

// Find objects
const users = store.objects.find('User', u => u.active)
const user = store.objects.findByUUID('user-123')

// Convert between plain and store objects
const plainUser = store.objects.export(user)
const storeUser = store.objects.import(plainData, 'User')
```

### History Operations
```typescript
// Time travel
store.history.undo()
store.history.redo()

// Access historical states
const oldUser = store.history.fromState(5, user)
const state = store.history.getStateByIndex(3)

// Transaction management
if (!store.history.isInUpdateMode()) {
  store.history.undo()
}

// Change tracking
const changes = store.history.getAllChanges('only_modifications')
```

### Registry Operations
```typescript
// Work with namespaces
const userNamespace = store.registry.getNamespace('UserDomain')
const productNamespace = store.registry.getNamespace('ProductDomain')

// Type operations within namespace
const userType = userNamespace.getType('User')
const userProps = userNamespace.getProperties('User')
const UserClass = userNamespace.getClass('User')

// Registry sync operations
await store.registry.addRemote('public', 'https://public-schemas.aelastics.com')
await store.registry.cloneNamespace('public', 'CommonTypes')
await store.registry.sync('public', 'CommonTypes')

// Validate types
const result = userNamespace.validateType('User')
```

### Data Operations
```typescript
// Serialize individual objects
const userJson = store.data.serialize(user)
const restoredUser = store.data.deserialize(userJson, 'User')

// Future batch operations
const allUsersJson = store.data.serializeBatch(users)
const restoredUsers = store.data.deserializeBatch(allUsersJson)
```

### Store-Level Operations
```typescript
// Export/import entire store state
const fullState = store.export()    // All objects + history + metadata
store.import(fullState)             // Restore complete state

// Object lifecycle utilities
const storeObject = store.makeEternal(plainObject)
const plainObject = store.makeRegular(storeObject)
```

### Event Operations
```typescript
// Subscribe to specific events
const unsubscribe = store.events.subscribe(
  (event) => console.log('User updated:', event),
  'after', 'update', 'User'
)

// Object-specific subscriptions
store.events.subscribeToObject(user, (updatedUser) => {
  console.log('User changed:', updatedUser)
})

// Store-wide subscriptions
store.events.subscribeToStore(() => {
  console.log('Store state changed')
})
```

## Design Principles

### 1. Clear Separation of Concerns
- **Objects**: Individual object lifecycle and conversion
- **History**: State management and time travel
- **Registry**: Type registry with namespace management and distributed sync
- **Data**: JSON serialization/deserialization  
- **Events**: Subscription and notification management

### 2. Intuitive API Structure
The API reads like natural language:
```typescript
store.objects.create('User', { name: 'John' })    // "store, create a User object"
store.history.undo()                              // "store, undo from history"
store.registry.getNamespace('UserDomain')         // "store, get UserDomain namespace from registry"  
store.data.serialize(user)                        // "store, serialize data"
store.events.subscribe(callback, ...)             // "store, subscribe to events"
```

### 3. Hierarchical Operations
Operations are organized by scope and responsibility:

- **Store-level**: `import()`/`export()` - entire store state
- **Object-level**: `objects.import()`/`objects.export()` - plain ↔ store objects
- **Data-level**: `data.serialize()`/`data.deserialize()` - object ↔ JSON

### 4. Interface Segregation
Consumers only depend on the interfaces they need:
```typescript
// React hooks only need object operations
function useObject(objectManager: IObjects) { }

// Serialization utilities only need data operations
function saveToFile(dataManager: IData) { }

// Time travel features only need history operations
function TimeTravel(historyManager: IHistory) { }
```

## Implementation Strategy

### Phase 1: Internal Segregation
- Keep existing `StoreClass` as single implementation
- Use **Facade Pattern** to expose clean interfaces
- Maintain backward compatibility

### Phase 2: Gradual Migration
- Update consuming code to use specific interfaces
- Replace direct `StoreClass` usage with interface usage
- Update tests to mock specific interfaces

### Phase 3: Optional Decomposition
- Could split into separate classes if needed:
```typescript
export class StoreClass implements IStore {
  private readonly _objects: ObjectManager
  private readonly _history: HistoryManager
  private readonly _schemas: SchemaManager
  private readonly _data: DataManager
  
  get objects(): IObjects { return this._objects }
  get history(): IHistory { return this._history }
  // etc.
}
```

## Gradual Implementation Strategy

### Current Phase: Interface Separation with Existing Implementations

For the initial interface separation, we will use the existing implementations from the current codebase:

1. **Registry Implementation**: Use the existing `SchemaRegister` and related interfaces from the `/meta` folder
   - Keep the current schema registration functionality that's already integrated into the store
   - This implementation is functional even if not ideal - we can improve it later
   - Focus on interface separation rather than rebuilding the registry from scratch

2. **Object Management**: Use existing `ObjectManager` implementation
   - Already provides the necessary object lifecycle operations
   - Expose through clean `IObjects` interface

3. **History Management**: Use existing history/state management in `StoreClass`
   - Expose through clean `IHistory` interface

4. **Data Serialization**: Use existing serialization functionality
   - Expose through clean `IData` interface

5. **Event System**: Use existing `SubscriptionManager`
   - Expose through clean `IEvents` interface

### Benefits of This Approach

- **Faster Implementation**: Focus on interface separation without rebuilding core functionality
- **Reduced Risk**: Keep working implementations while improving the API surface
- **Incremental Progress**: Each interface can be refined independently
- **Backward Compatibility**: Existing code continues to work during transition

### Future Refinement Plan

Once interface separation is complete and tested:

1. **Registry Enhancement**: Implement the simplified read-only metadata provider registry as documented in `registry-architecture.md`
2. **Performance Optimization**: Optimize individual interface implementations
3. **Additional Features**: Add new capabilities to specific interfaces as needed
4. **Alternative Backends**: Implement alternative storage backends for specific interfaces

This gradual approach ensures we maintain a working system while progressively improving the architecture.

## Benefits

1. **Better Testability**: Mock only the interfaces you need
2. **Cleaner Dependencies**: Components depend on specific capabilities
3. **Improved Maintainability**: Clear boundaries between responsibilities
4. **Enhanced Extensibility**: Easy to add new capabilities to specific areas
5. **Type Safety**: Consumers can't accidentally call wrong methods
6. **Documentation**: Interfaces serve as clear contracts

## Backward Compatibility

This design maintains full backward compatibility:
- Existing `StoreClass` continues to work
- Current API methods remain available
- Migration to new interfaces is optional and gradual
- No breaking changes to existing code

## Future Extensions

The interface design allows for clean extensions:
- Add new methods to specific interfaces
- Introduce new namespaces (e.g., `store.cache()`, `store.transactions()`)
- Implement alternative backends for specific interfaces
- Add batch operations and optimizations

This interface design provides a solid foundation for the evolution of the Eternal Store library while maintaining its powerful capabilities and ensuring clean, maintainable code.