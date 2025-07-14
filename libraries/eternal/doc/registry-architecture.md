# Registry Architecture

## Overview

The Registry Architecture provides a **read-only metadata storage system** for type definitions and metadata. The registry serves as a **metadata provider** to support store operations, focusing on validation and access rather than creation or manipulation of type definitions.

## Core Concepts

### Registry as Read-Only Metadata Provider
A **Registry** is a read-only storage and access layer for validated type definitions. Each registry:
- Provides read-only access to imported metadata
- Validates imported namespaces and type definitions  
- Supports store operations with type metadata
- Focuses on local implementation (memory-based initially)

### Namespace as Logical Container
A **Namespace** is a logical grouping of related type definitions within a registry. Each namespace:
- Contains validated type definitions (e.g., "UserDomain", "ProductDomain")
- Provides read-only access to types and their metadata
- Supports type introspection for store operations
- Maintains validation state for all contained types

### Metadata Sources
Type definitions and namespaces are **created externally** using various tools and frameworks:
- **Zod libraries**: Runtime type validation schemas
- **Aelastics frameworks**: Model Store and other type definition tools
- **Custom tools**: Domain-specific type definition generators
- **Import formats**: JSON, YAML, or other serialized metadata formats

The registry **imports and validates** these heterogeneous metadata formats into a consistent internal representation.

## Architecture Components

### Core Interfaces

```typescript
interface IRegistry {
  // Namespace access (read-only)
  getNamespace(name: string): INamespace | undefined
  listNamespaces(): string[]
  hasNamespace(name: string): boolean
  
  // Import/export operations (the only "write" operations)
  importNamespace(definition: NamespaceDefinition): ValidationResult
  exportNamespace(name: string): NamespaceDefinition
  
  // Validation support
  validateNamespace(definition: NamespaceDefinition): ValidationResult
  validateTypeDefinition(typeDef: TypeMeta): ValidationResult
  
  // Registry metadata (read-only)
  getInfo(): RegistryInfo
}

interface INamespace {
  readonly name: string
  readonly description?: string
  readonly version?: string
  
  // Type access (read-only)
  getType(typeName: string): TypeMeta | undefined
  hasType(typeName: string): boolean
  listTypes(): string[]
  
  // Type introspection (what store needs for operations)
  getProperties(typeName: string): Map<string, PropertyMeta>
  getClass(typeName: string): any
  getInheritanceChain(typeName: string): string[]
  getAllSubtypes(typeName: string): string[]
  
  // Validation support
  validateType(typeName: string): ValidationResult
  
  // Namespace metadata (read-only)
  export(): NamespaceDefinition
}
```

### Supporting Types

```typescript
interface RegistryInfo {
  url: string
  name: string
  description: string
  version: string
  created: Date
  lastModified: Date
}

interface RemoteConfig {
  name: string
  url: string
  auth?: AuthConfig
  syncPolicy?: 'manual' | 'auto' | 'pull-only'
}

interface AuthConfig {
  type: 'none' | 'basic' | 'oauth' | 'apikey'
  credentials?: any
}

interface NamespaceDefinition {
  name: string
  description?: string
  types: { [typeName: string]: TypeMeta }
  version: string
  dependencies?: string[]
}
```

## Registry Distribution Model

### Git-Style Registry URLs
Each registry instance has its own URL, similar to Git repositories:

```
https://schemas.mycompany.com/          # Company internal registry
https://public-schemas.aelastics.com/   # Public community registry  
https://localhost:3000/                 # Local development registry
https://prod-registry.aws.com/          # Production cloud registry
file://./local-schemas                  # Local filesystem registry
```

### Remote Registry Management
Registries can reference and sync with other registries (like Git remotes):

```typescript
// Add remote registries
await registry.addRemote('public', 'https://public-schemas.aelastics.com')
await registry.addRemote('partner', 'https://schemas.partner.com', { 
  type: 'oauth', 
  credentials: { token: 'xxx' } 
})

// List configured remotes
const remotes = registry.listRemotes()
// [
//   { name: 'public', url: 'https://public-schemas.aelastics.com' },
//   { name: 'partner', url: 'https://schemas.partner.com' }
// ]
```

### Namespace Synchronization
Namespaces can be synced between registries:

```typescript
// Clone namespace from remote (like git clone)
await registry.cloneNamespace('public', 'CommonTypes')

// Pull updates from remote (like git pull)
await registry.pull('public', 'CommonTypes')

// Push local changes to remote (like git push)
await registry.push('partner', 'UserDomain')

// Sync all namespaces with remote
await registry.sync('public')
```

## Registry Implementation Types

### 1. In-Memory Registry
```typescript
class InMemoryRegistry implements IRegistry {
  private namespaces = new Map<string, INamespace>()
  private remotes = new Map<string, RemoteConfig>()
  
  // Fast, ephemeral storage for development/testing
}
```

### 2. Filesystem Registry
```typescript
class FileSystemRegistry implements IRegistry {
  constructor(private basePath: string) {}
  
  // Persistent local storage using file system
  // Structure: basePath/namespaces/{namespaceName}/types/{typeName}.json
}
```

### 3. Database Registry
```typescript
class DatabaseRegistry implements IRegistry {
  constructor(private connectionString: string) {}
  
  // Persistent storage using relational/document database
  // Supports transactions, indexing, and complex queries
}
```

### 4. Distributed Registry
```typescript
class GitRegistry implements IRegistry {
  constructor(private repoUrl: string) {}
  
  // Git-based distributed storage
  // Full version control, branching, merging
}
```

### 5. Federated Registry
```typescript
class FederatedRegistry implements IRegistry {
  constructor(private registries: IRegistry[]) {}
  
  // Combines multiple registries
  // Type resolution across multiple sources
}
```

## REST API Design

### Registry-Specific Endpoints
Each registry exposes its own REST API:

```http
# Registry information
GET https://schemas.mycompany.com/

# Namespace operations
GET    https://schemas.mycompany.com/namespaces
GET    https://schemas.mycompany.com/namespaces/{namespaceName}
POST   https://schemas.mycompany.com/namespaces
DELETE https://schemas.mycompany.com/namespaces/{namespaceName}

# Type operations within namespace
GET    https://schemas.mycompany.com/namespaces/{namespace}/types
GET    https://schemas.mycompany.com/namespaces/{namespace}/types/{typeName}
POST   https://schemas.mycompany.com/namespaces/{namespace}/types
PUT    https://schemas.mycompany.com/namespaces/{namespace}/types/{typeName}
DELETE https://schemas.mycompany.com/namespaces/{namespace}/types/{typeName}

# Registry management
GET  https://schemas.mycompany.com/.registry/info
GET  https://schemas.mycompany.com/.registry/remotes
POST https://schemas.mycompany.com/.registry/remotes
POST https://schemas.mycompany.com/.registry/sync/{remoteName}
POST https://schemas.mycompany.com/.registry/pull/{remoteName}/{namespaceName}
POST https://schemas.mycompany.com/.registry/push/{remoteName}/{namespaceName}
POST https://schemas.mycompany.com/.registry/clone
```

### Registry Configuration
Each registry maintains configuration similar to Git:

```json
{
  "url": "https://schemas.mycompany.com",
  "name": "company-schemas",
  "description": "Internal company type definitions",
  "version": "1.0.0",
  "remotes": {
    "public": {
      "url": "https://public-schemas.aelastics.com",
      "syncPolicy": "pull-only"
    },
    "partner": {
      "url": "https://schemas.partner.com",
      "auth": {
        "type": "oauth",
        "credentials": { "token": "..." }
      }
    }
  },
  "namespaces": {
    "UserDomain": {
      "upstream": null,
      "readonly": false
    },
    "CommonTypes": {
      "upstream": "public/CommonTypes",
      "readonly": true
    }
  }
}
```

## Usage Examples

### Basic Registry Operations
```typescript
// Connect to registry
const registry = new RegistryClient('https://schemas.mycompany.com')

// Work with namespaces
const userNamespace = registry.getNamespace('UserDomain')
const productNamespace = registry.getNamespace('ProductDomain')

// Register types
await userNamespace.registerType('User', {
  qName: 'User',
  properties: new Map([
    ['name', { type: 'string', required: true }],
    ['email', { type: 'string', required: true }]
  ])
})

// Query types
const userType = userNamespace.getType('User')
const userProperties = userNamespace.getProperties('User')
```

### Distributed Operations
```typescript
// Set up distributed registry
await registry.addRemote('public', 'https://public-schemas.aelastics.com')
await registry.addRemote('partner', 'https://schemas.partner.com')

// Clone common types from public registry
await registry.cloneNamespace('public', 'CommonTypes')

// Develop custom types locally
const customNamespace = registry.createNamespace('CustomTypes')
await customNamespace.registerType('CustomUser', customUserDefinition)

// Sync with partner
await registry.push('partner', 'CustomTypes')
await registry.pull('partner', 'SharedTypes')
```

### Store Integration
```typescript
// Store can work with multiple registries
const store = createStore(schema, {
  registries: [
    'https://schemas.mycompany.com',        // Primary registry
    'https://public-schemas.aelastics.com', // Fallback for common types
    'file://./local-schemas'                // Local development
  ]
})

// Create objects using types from different namespaces
const user = store.objects.create('UserDomain.User', { 
  name: 'John',
  email: 'john@example.com'
})

const address = store.objects.create('CommonTypes.Address', {
  street: '123 Main St',
  city: 'Anytown'
})
```

## Package Architecture

### Separate Packages
```
@aelastics/type-registry          # Core registry interfaces and base classes
@aelastics/registry-memory        # In-memory registry implementation
@aelastics/registry-filesystem    # Filesystem-based registry
@aelastics/registry-database      # Database-backed registry
@aelastics/registry-git           # Git-based distributed registry
@aelastics/registry-api           # REST API server for registries
@aelastics/registry-client        # HTTP client for remote registries
@aelastics/eternal                # Uses registry package for type management
```

### Registry Factory
```typescript
// Registry factory for different implementations
export function createRegistry(config: RegistryConfig): IRegistry {
  switch (config.type) {
    case 'memory':
      return new InMemoryRegistry()
    case 'filesystem':
      return new FileSystemRegistry(config.path)
    case 'database':
      return new DatabaseRegistry(config.connectionString)
    case 'git':
      return new GitRegistry(config.repoUrl)
    case 'remote':
      return new RemoteRegistry(config.url, config.auth)
    case 'federated':
      return new FederatedRegistry(config.registries)
    default:
      throw new Error(`Unsupported registry type: ${config.type}`)
  }
}
```

## Benefits

### 1. **Distributed Development**
- Teams can work with independent registries
- No single point of failure
- Offline development capability

### 2. **Flexible Deployment**
- In-memory for development/testing
- Filesystem for local persistence
- Database for enterprise scenarios
- Git for full version control
- Cloud for scalable deployment

### 3. **Namespace Isolation**
- Logical separation of type domains
- Independent versioning and sync
- Clear ownership boundaries

### 4. **Git-Like Workflow**
- Familiar development model
- Pull/push for collaboration
- Clone for distribution
- Remote management for federation

### 5. **Extensible Storage**
- Pluggable registry implementations
- Support for different storage backends
- Custom authentication and sync policies

### 6. **Type Federation**
- Multiple registries can be combined
- Type resolution across sources
- Fallback and priority mechanisms

This registry architecture provides a robust, scalable foundation for managing type definitions in distributed systems while maintaining the familiar Git workflow that developers already understand.