# API Overview

This section provides an overview of the **AelasticS-Observables** API, including function signatures, parameters, and return types.

## Available Observable Structures

AelasticS-Observables provides observability for common JavaScript/TypeScript data structures using proxies.

| Data Structure | Function Implemented | Supported Handlers |
|---------------|---------------------|----------------------|
| **Objects**  | `createObservableObject` | `set`, `delete`, `method`, `defaultAction` |
| **Arrays**   | `createObservableArray`  | `set`, `delete`, `push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `sort`, `fill`, `defaultAction` |
| **Maps**     | `createObservableMap`    | `set`, `delete`, `clear`, `get`, `has`, `forEach`, `defaultAction` |
| **Sets**     | `createObservableSet`    | `add`, `delete`, `clear`, `has`, `forEach`, `defaultAction` |

Each function wraps a JavaScript data structure with a **Proxy** to intercept operations and apply custom handlers.

## General API Structure

Each observable creation function follows this structure:

```typescript
function createObservable<Type, Extra = {}>(
    target: Type,
    handlers: Handlers<Type, Extra>,
    defaultMutation?: boolean,
    extra?: Extra
): Type;
```

### Parameters
| Name             | Type                          | Default | Description |
|-----------------|-----------------------------|---------|-------------|
| `target`        | `Type`                        | —       | The object/array/map/set to make observable |
| `handlers`      | `Handlers<Type, Extra>`       | `{}`    | Custom handlers for operations |
| `defaultMutation` | `boolean`                   | `true`  | Whether to allow default mutations |
| `extra`         | `Extra (optional)`            | `{}`    | Additional context for handlers |

### Common Handlers
- **`set(target, key, value, extra?)`** → Called when setting a property.
- **`delete(target, key, extra?)`** → Called when deleting a property.
- **`method(target, key, args[], extra?)`** → Called for function calls on objects.
- **Collection-Specific Handlers**: `push`, `pop`, `add`, `clear`, `forEach`, etc.

## Example Usage

### Creating an Observable Object
```typescript
import { createObservableObject } from 'aelastics-observables';

const obj = createObservableObject({ name: 'Alice' }, {
    set: (target, key, value) => {
        console.log(`Setting ${String(key)} to ${value}`);
        return true;
    }
});

obj.name = 'Bob'; // Logs: "Setting name to Bob"
```

### Creating an Observable Array
```typescript
import { createObservableArray } from 'aelastics-observables';

const arr = createObservableArray([1, 2, 3], {
    push: (target, items) => {
        console.log(`Added ${items.length} items`);
        return true;
    }
});

arr.push(4, 5); // Logs: "Added 2 items"
```

## Next Steps

Explore detailed API documentation for each observable type:

➡ **[Observable Objects](./api-observable-object.md)** – API reference for `createObservableObject`  
➡ **[Observable Arrays](./api-observable-array.md)** – API reference for `createObservableArray`  
➡ **[Observable Maps](./api-observable-map.md)** – API reference for `createObservableMap`  
➡ **[Observable Sets](./api-observable-set.md)** – API reference for `createObservableSet`  
