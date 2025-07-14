# Store Extension Strategies

## Overview

This document outlines different strategies for extending the Eternal Store library with specialized functionality through separate packages. The goal is to enable domain-specific stores (like DocumentStore, ModelStore) that can be distributed as independent libraries while maintaining proper inheritance hierarchies and operation overrides.

## Requirements

1. **Separate Library Distribution**: Each extension (DocumentStore, ModelStore) must be distributable as a separate Rush.js package
2. **Inheritance Hierarchy**: Support hierarchical extensions where `IModelStore > IDocumentStore > IStore`
3. **Operation Override**: Allow extending stores to modify/enhance base operations (e.g., custom create behavior for documents)
4. **Type Safety**: Full TypeScript support with proper interface inheritance
5. **Encapsulation**: Extensions should only use public APIs, not internal implementation details

## Extension Strategies Evaluated

### Strategy 1: Composable Factory Pattern

#### Implementation

```typescript
// @aelastics/eternal (base package)
export function createStore(schema: TypeSchema): IStore {
  // Pure facade implementation - no internals exposed
  const store = new StoreClass(schema)
  return createStoreFacade(store)
}

// @aelastics/eternal-documents (separate package)
import { createStore, IStore } from '@aelastics/eternal'

export interface IDocumentStore extends IStore {
  documents: {
    create(content: string): Document
    search(query: string): Document[]
    index(doc: Document): void
  }
}

export function createDocumentStore(schema: TypeSchema): IDocumentStore {
  const base = createStore(schema)
  
  return {
    ...base,  // Inherit all base functionality
    
    // Override objects.create for document-specific behavior
    objects: {
      ...base.objects,
      create: <T>(type: string, initialState?: Partial<T>) => {
        const obj = base.objects.create(type, initialState)
        if (type === 'Document') {
          // Auto-index documents on creation
          documents.index(obj)
        }
        return obj
      }
    },
    
    documents: {
      create: (content: string) => this.objects.create('Document', { content }),
      search: (query: string) => base.objects.find('Document', doc => doc.content.includes(query)),
      index: (doc: any) => { /* indexing logic */ }
    }
  }
}

// @aelastics/eternal-models (separate package)
import { createDocumentStore, IDocumentStore } from '@aelastics/eternal-documents'

export interface IModelStore extends IDocumentStore {
  models: {
    train(dataset: any): Model
    predict(input: any): any
    register(model: Model): void
  }
}

export function createModelStore(schema: TypeSchema): IModelStore {
  const docStore = createDocumentStore(schema)  // Build on document store
  
  return {
    ...docStore,  // Inherit all document functionality
    
    // Further override objects.create for model-specific behavior
    objects: {
      ...docStore.objects,
      create: <T>(type: string, initialState?: Partial<T>) => {
        const obj = docStore.objects.create(type, initialState)  // Inherits document behavior
        if (type === 'Model') {
          // Model-specific creation logic
          this.models.register(obj)
        }
        return obj
      }
    },
    
    models: {
      train: (dataset: any) => this.objects.create('Model', { dataset }),
      predict: (input: any) => { /* prediction logic */ },
      register: (model: any) => { /* model registry logic */ }
    }
  }
}
```

#### Usage

```typescript
import { createModelStore } from '@aelastics/eternal-models'

const store = createModelStore(schema)

// Full hierarchy available:
store.objects.create('Model', {})      // Uses model-specific creation (with document auto-indexing)
store.documents.search('query')        // Document functionality
store.models.train(dataset)            // Model functionality
store.history.undo()                   // Base store functionality
```

### Strategy 2: Decorator Pattern

#### Implementation

```typescript
// @aelastics/eternal-documents (separate package)
export class DocumentStoreDecorator {
  decorate(store: IStore): IDocumentStore {
    const originalCreate = store.objects.create
    
    return {
      ...store,  // Delegate all base methods
      
      objects: {
        ...store.objects,
        create: <T>(type: string, initialState?: Partial<T>) => {
          const obj = originalCreate(type, initialState)
          if (type === 'Document') {
            // Auto-index documents
            this.documents.index(obj)
          }
          return obj
        }
      },
      
      documents: {
        create: (content: string) => this.objects.create('Document', { content }),
        index: (doc: any) => { /* indexing */ },
        search: (query: string) => store.objects.find('Document', doc => doc.content.includes(query))
      }
    }
  }
}

// @aelastics/eternal-models (separate package)
export class ModelStoreDecorator {
  decorate(docStore: IDocumentStore): IModelStore {
    const originalCreate = docStore.objects.create
    
    return {
      ...docStore,  // Inherit document functionality
      
      objects: {
        ...docStore.objects,
        create: <T>(type: string, initialState?: Partial<T>) => {
          const obj = originalCreate(type, initialState)  // Inherits document behavior
          if (type === 'Model') {
            this.models.register(obj)
          }
          return obj
        }
      },
      
      models: {
        train: (dataset: any) => this.objects.create('Model', { dataset }),
        register: (model: any) => { /* model registry */ }
      }
    }
  }
}
```

#### Usage

```typescript
import { createStore } from '@aelastics/eternal'
import { DocumentStoreDecorator } from '@aelastics/eternal-documents'
import { ModelStoreDecorator } from '@aelastics/eternal-models'

const baseStore = createStore(schema)
const docStore = new DocumentStoreDecorator().decorate(baseStore)
const modelStore = new ModelStoreDecorator().decorate(docStore)
```

### Strategy 3: Plugin Pattern

#### Implementation

```typescript
// @aelastics/eternal (base package)
export interface StorePlugin {
  namespace: string
  extend(store: IStore): any
  overrides?: {
    [method: string]: (original: Function, ...args: any[]) => any
  }
}

export function createStore(schema: TypeSchema, plugins: StorePlugin[] = []): IStore {
  const baseStore = createBaseFacade(schema)
  
  // Apply plugin overrides
  plugins.forEach(plugin => {
    if (plugin.overrides) {
      Object.entries(plugin.overrides).forEach(([method, override]) => {
        const original = getNestedMethod(baseStore, method)
        setNestedMethod(baseStore, method, (...args: any[]) => override(original, ...args))
      })
    }
    
    // Add plugin functionality
    ;(baseStore as any)[plugin.namespace] = plugin.extend(baseStore)
  })
  
  return baseStore
}

// @aelastics/eternal-documents (separate package)
export class DocumentPlugin implements StorePlugin {
  namespace = 'documents'
  
  overrides = {
    'objects.create': (original: Function, type: string, initialState: any) => {
      const obj = original(type, initialState)
      if (type === 'Document') {
        // Access documents through the store
        const store = this.getStore()
        store.documents.index(obj)
      }
      return obj
    }
  }
  
  extend(store: IStore) {
    return {
      create: (content: string) => store.objects.create('Document', { content }),
      index: (doc: any) => { /* indexing */ },
      search: (query: string) => store.objects.find('Document', doc => doc.content.includes(query))
    }
  }
}
```

#### Usage

```typescript
import { createStore } from '@aelastics/eternal'
import { DocumentPlugin } from '@aelastics/eternal-documents'
import { ModelPlugin } from '@aelastics/eternal-models'

const store = createStore(schema, [
  new DocumentPlugin(),
  new ModelPlugin()
])

store.documents.search('query')  // Available
store.models.train(dataset)      // Available
```

## Detailed Comparison

| Feature | Factory Pattern | Decorator Pattern | Plugin Pattern |
|---------|----------------|------------------|----------------|
| **Separate Libraries** | ✅ Perfect | ✅ Perfect | ✅ Perfect |
| **Type Safety** | ✅ Full inheritance | ✅ Full inheritance | ⚠️ Limited (dynamic) |
| **Operation Override** | ✅ Natural override | ✅ Explicit override | ✅ Centralized override |
| **Hierarchy Support** | ✅ Clear chain | ✅ Clear chain | ❌ Flat (no inheritance) |
| **Simplicity** | ✅ Very simple | ✅ Simple | ❌ Complex |
| **Composability** | ✅ Perfect | ✅ Perfect | ✅ Good |
| **IDE Support** | ✅ Excellent | ✅ Excellent | ⚠️ Limited |
| **Runtime Flexibility** | ❌ Compile-time only | ❌ Compile-time only | ✅ Runtime plugins |
| **Package Dependencies** | Clear hierarchy | Clear hierarchy | Flat dependencies |
| **Learning Curve** | Low | Low | High |

## Advantages and Disadvantages

### Factory Pattern
**Advantages:**
- ✅ Simplest implementation and usage
- ✅ Perfect TypeScript support with interface inheritance
- ✅ Natural operation overrides through object spread
- ✅ Clear dependency hierarchy between packages
- ✅ Excellent IDE support and autocompletion
- ✅ Only uses public APIs (perfect encapsulation)

**Disadvantages:**
- ❌ Requires compile-time knowledge of extensions
- ❌ Less dynamic than plugin approach

### Decorator Pattern
**Advantages:**
- ✅ Explicit decoration semantics
- ✅ Good TypeScript support
- ✅ Clear operation override mechanism
- ✅ Flexible composition

**Disadvantages:**
- ❌ More verbose usage (explicit decoration calls)
- ❌ Slightly more complex than factory pattern

### Plugin Pattern
**Advantages:**
- ✅ Maximum runtime flexibility
- ✅ Can add plugins dynamically
- ✅ Good for unknown extensions at compile time

**Disadvantages:**
- ❌ Limited TypeScript support (dynamic properties)
- ❌ Complex override mechanism
- ❌ No clear inheritance hierarchy
- ❌ Harder to understand and debug
- ❌ Poor IDE support for dynamic properties

## Conclusion and Recommendation

**Recommended Strategy: Composable Factory Pattern**

The **Factory Pattern** is the clear winner for the following reasons:

### 1. **Perfect Library Separation**
Each extension can be a completely separate Rush.js package with clear dependencies:
```
@aelastics/eternal (base)
@aelastics/eternal-documents (depends on: eternal)
@aelastics/eternal-models (depends on: eternal, eternal-documents)
```

### 2. **True Interface Inheritance**
The TypeScript interface hierarchy works naturally:
```typescript
interface IStore { /* base functionality */ }
interface IDocumentStore extends IStore { /* + document functionality */ }
interface IModelStore extends IDocumentStore { /* + model functionality */ }
```

### 3. **Natural Operation Override**
Overriding base operations is straightforward and type-safe:
```typescript
return {
  ...base,
  objects: {
    ...base.objects,
    create: (type, initialState) => {
      const obj = base.objects.create(type, initialState)
      if (type === 'Document') {
        // Custom document creation logic
        this.documents.index(obj)
      }
      return obj
    }
  }
}
```

### 4. **Excellent Developer Experience**
- Perfect IDE support with autocompletion
- Clear error messages
- Intuitive usage patterns
- Easy to understand and maintain

### 5. **Proper Encapsulation**
Extensions only use the public `IStore` interface - no knowledge of internal `StoreClass` implementation required.

## Implementation Guidelines

### Package Structure
```
packages/
  eternal/                     # Base store
    src/interfaces/IStore.ts
    src/store/createStore.ts
  eternal-documents/           # Document extension
    src/createDocumentStore.ts
    src/interfaces/IDocumentStore.ts
  eternal-models/              # Model extension  
    src/createModelStore.ts
    src/interfaces/IModelStore.ts
```

### Best Practices

1. **Clear Interface Definitions**: Each package should export clear interfaces
2. **Public API Only**: Extensions should only use exported functions and interfaces
3. **Proper Dependencies**: Use package.json dependencies to enforce hierarchy
4. **Operation Override Patterns**: Follow consistent patterns for overriding base operations
5. **Documentation**: Document extension points and override mechanisms

This strategy provides the perfect balance of simplicity, type safety, and extensibility while supporting true separate library distribution in a Rush.js monorepo.