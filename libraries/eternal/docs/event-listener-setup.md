# Event Listener Setup Guide

This guide explains how to setup and register event listeners in the Eternal Store system for monitoring changes to objects and the store.

## Getting Started

To use the event system, you need to access the `IEvents` interface from your store:

```typescript
import { createStore } from "../store/createStore";
import { RegistryService } from "../registry/RegistryService";

// Setup store
const registry = new RegistryService(registryMetadata);
registry.importNamespace(yourNamespace);
const store = createStore(registry);
const events = store.events;
```

## Event Pattern Subscription

### Subscribe to Create Operations

```typescript
const unsubscribe = events.subscribe(
  (event) => {
    console.log("Object created:", event);
    return { success: true };
  },
  "before",           // Timing: when to trigger
  "create",           // Operation: what operation to monitor
  "/company/Company"  // Object type: which type to monitor
);
```

### Subscribe to Update Operations

For update operations, you must specify the property parameter:

```typescript
// Listen to all property updates on a type
const unsubscribe = events.subscribe(
  (event) => {
    console.log("Object updated:", event);
    return { success: true };
  },
  "before",
  "update",
  "/company/Company",
  "*"                 // "*" means any property update
);

// Listen to specific property updates
const unsubscribe = events.subscribe(
  (event) => {
    console.log("Employee name changed:", event);
    return { success: true };
  },
  "before",
  "update",
  "/company/Employee",
  "name"              // Only "name" property updates
);
```

### Subscribe to Delete Operations

```typescript
const unsubscribe = events.subscribe(
  (event) => {
    console.log("Object deleted:", event);
    return { success: true };
  },
  "before",
  "delete",
  "/company/Company"
);
```

## Event Timing Options

You can specify when to trigger the event:

- `"before"` - Before the operation executes
- `"after"` - After the operation completes
- `"beforeCommit"` - Before changes are committed
- `"afterCommit"` - After changes are committed
- `"*"` - All timing events

```typescript
// Listen to after create events
const unsubscribe = events.subscribe(
  (event) => ({ success: true }),
  "after",
  "create",
  "/company/Company"
);
```

## Wildcard Subscriptions

Use wildcards to listen to broader sets of events:

```typescript
// Listen to all operations on any type (including updates)
// Note: This will catch update events but you won't get property-specific details
const unsubscribe = events.subscribe(
  (event) => ({ success: true }),
  "*",        // Any timing
  "*",        // Any operation (create, update, delete, import)
  "*"         // Any type
);

// Listen to all create operations regardless of type
const unsubscribe = events.subscribe(
  (event) => ({ success: true }),
  "before",
  "create",
  "*"         // Any type
);

// Listen to all update operations on any type and any property
const unsubscribe = events.subscribe(
  (event) => ({ success: true }),
  "before",
  "update",
  "*",        // Any type
  "*"         // Any property - required for update operations
);
```

## Understanding Property Parameter

The property parameter is **required for update operations** and **optional for others**:

```typescript
// ✅ Correct: Update with property specified
events.subscribe(listener, "before", "update", "/company/Company", "*");
events.subscribe(listener, "before", "update", "/company/Company", "name");

// ✅ Correct: Create without property (property is optional)
events.subscribe(listener, "before", "create", "/company/Company");

// ❌ Incorrect: Update without property parameter
// This may not work as expected
events.subscribe(listener, "before", "update", "/company/Company");
```

Property parameter options:
- `"*"` - Any property update
- `"propertyName"` - Specific property updates only
- `undefined` - Not applicable (for create, delete, import operations)

## Object-Specific Subscriptions

### Monitor Individual Objects

Subscribe to changes on a specific object instance:

```typescript
// Create an object
const company = store.objects.create("/company/Company", {
  id: "comp-001",
  name: "Tech Corp"
});

// Subscribe to updates on this specific object
const unsubscribe = events.subscribeToObject(company, (updatedObject) => {
  console.log("This company was updated:", updatedObject.name);
});
```

## Store-Wide Subscriptions

### Monitor All Store Changes

Subscribe to any changes happening in the store:

```typescript
const unsubscribe = events.subscribeToStore(() => {
  console.log("Something in the store changed");
  // Refresh UI, sync data, etc.
});
```

## Event Listener Requirements

### Return Value

All event listeners must return a `Result` object:

```typescript
const unsubscribe = events.subscribe(
  (event) => {
    // Your logic here
    if (someCondition) {
      return { success: false, errors: ["Validation failed"] };
    }
    return { success: true };
  },
  "before",
  "create",
  "/company/Company"
);
```

### Event Payload

Event listeners receive an `EventPayload` with:

```typescript
interface EventPayload {
  timing: string;       // "before", "after", "beforeCommit", "afterCommit"
  operation: string;    // "create", "update", "delete", "import"
  objectType: string;   // "/company/Company"
  property?: string;    // Property name for updates (optional)
  timestamp: number;    // When the event occurred
}
```

## Unsubscribing

Always clean up event listeners when done:

```typescript
const unsubscribe = events.subscribe(listener, "before", "create", "/company/Company");

// Later, when component unmounts or cleanup is needed
unsubscribe();
```

## Common Patterns

### Validation

```typescript
const validateCompany = events.subscribe(
  (event) => {
    if (event.operation === "create") {
      // Validate company data
      return { success: true };
    }
    return { success: true };
  },
  "before",
  "create",
  "/company/Company"
);
```

### Property-Specific Updates

```typescript
// Monitor salary changes for audit purposes
const salaryAudit = events.subscribe(
  (event) => {
    console.log(`Salary changed for employee at ${new Date(event.timestamp)}`);
    return { success: true };
  },
  "after",
  "update",
  "/company/Employee",
  "salary"
);
```

### Logging

```typescript
const auditLog = events.subscribe(
  (event) => {
    const propInfo = event.property ? ` (property: ${event.property})` : '';
    console.log(`${event.operation} on ${event.objectType}${propInfo} at ${new Date(event.timestamp)}`);
    return { success: true };
  },
  "after",
  "*",
  "*",
  "*"     // Include property parameter for update operations
);
```

### UI Updates

```typescript
const refreshUI = events.subscribeToStore(() => {
  // Trigger UI refresh when store changes
  updateView();
});
```

## Best Practices

1. **Always unsubscribe** when components unmount or objects are destroyed
2. **Use specific patterns** instead of wildcards when possible for better performance
3. **Return proper Result objects** from event listeners
4. **Handle errors gracefully** in event listeners
5. **For updates, always specify property** parameter (use "*" for any property)
6. **Keep event listeners lightweight** to avoid blocking operations
7. **Use property-specific subscriptions** when you only care about certain fields