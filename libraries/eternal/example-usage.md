# Registry Service Integration with Store

This document shows how to use the registry service with the store.

## Creating a Store with Registry Service

```typescript
import { 
  createStore, 
  RegistryService, 
  RegistryMetadata, 
  Namespace,
  ObjectTypeMeta,
  SimpleTypeMeta 
} from '@aelastics/eternal';

// Create a registry
const registry: RegistryMetadata = {
  namespaces: new Map(),
  name: "My App Registry",
  version: "1.0.0"
};

const registryService = new RegistryService(registry);

// Define types
const stringType: SimpleTypeMeta = {
  qName: "/base/string",
  category: "simple",
  kind: "string"
};

const userType: ObjectTypeMeta = {
  qName: "/app/User",
  category: "complex",
  kind: "entity",
  properties: new Map([
    ["id", {
      name: "id",
      typeRef: "/base/string",
      optional: false
    }],
    ["name", {
      name: "name", 
      typeRef: "/base/string",
      optional: false
    }]
  ]),
  identityKeys: ["id"]
};

// Create namespaces
const baseNamespace: Namespace = {
  qName: "/base",
  types: new Map([["string", stringType]]),
  exports: ["string"],
  imports: new Map()
};

const appNamespace: Namespace = {
  qName: "/app",
  types: new Map([["User", userType]]),
  exports: ["User"],
  imports: new Map([
    ["/base", ["string"]]
  ])
};

// Import namespaces
registryService.importNamespace(baseNamespace);
registryService.importNamespace(appNamespace);

// Create store from registry
const store = createStore(registryService);

// Use the store
const user = store.objects.create<{ id: string, name: string }>("/app/User", {
  id: "1",
  name: "John Doe"
});

console.log(user.name); // "John Doe"
```

## Benefits of Registry Service

1. **Namespace Organization**: Types are organized in hierarchical namespaces
2. **Import/Export System**: TypeScript-like module system for type reuse
3. **Resolved Types Optimization**: O(1) type lookup performance
4. **Advanced Features**: Wildcards, aliases, circular import detection
5. **Better Type System**: Enhanced type categories and validation
6. **Bidirectional Relationships**: Automatic inverse relationship management
7. **Role-Based System**: Support for type roles and behavior patterns
8. **Comprehensive Validation**: Better error handling and type validation

## Migration Path

The registry service approach is the only supported method for creating stores. It provides a complete type system with namespace organization, import/export capabilities, and performance optimizations.