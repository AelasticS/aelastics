# Core Concepts

## Understanding Observables

In **AelasticS-Observables**, observables are **JavaScript objects, arrays, maps, and sets** wrapped in a **Proxy**. This allows for real-time interception of changes and tracking of modifications.

Observables enable:
- **Automatic tracking** of state changes.
- **Customizable handlers** for modifying behavior.
- **Efficient, proxy-based observability** with low overhead.

## How Proxies Work

A **Proxy** in JavaScript wraps an object and intercepts operations like:
- Property access (`obj.key`)
- Assignments (`obj.key = value`)
- Deletions (`delete obj.key`)
- Function calls (`obj.method()`)

Example of a basic Proxy:
```typescript
const obj = new Proxy({}, {
    set(target, key, value) {
        console.log(`Setting ${String(key)} to ${value}`);
        target[key] = value;
        return true;
    }
});

obj.name = "Alice"; // Logs: "Setting name to Alice"
```

## Handlers in AelasticS-Observables

Handlers define **how** modifications to observables are managed. Each data structure supports different handlers.

### **Handlers for Objects**
| Handler | Description |
|---------|------------|
| `set` | Intercepts property assignments (`obj.key = value`) |
| `delete` | Intercepts deletions (`delete obj.key`) |
| `method` | Intercepts method calls (`obj.method()`) |
| `defaultAction` | Called for any unhandled operations |

Example:
```typescript
const obj = createObservableObject({ count: 0 }, {
    set: (target, key, value) => {
        console.log(`Setting ${String(key)} to ${value}`);
        return true;
    }
});
obj.count = 10; // Logs: "Setting count to 10"
```

### **Handlers for Arrays**
| Handler | Description |
|---------|------------|
| `set` | Intercepts item assignments (`arr[0] = value`) |
| `delete` | Intercepts deletions (`delete arr[0]`) |
| `push`, `pop`, `shift`, `unshift`, `splice` | Intercepts respective array methods |
| `reverse`, `sort`, `fill` | Intercepts transformation methods |
| `defaultAction` | Called for any unhandled operations |

Example:
```typescript
const arr = createObservableArray([1, 2, 3], {
    push: (target, items) => {
        console.log(`Added ${items.length} items`);
        return true;
    }
});
arr.push(4); // Logs: "Added 1 item"
```

### **Handlers for Maps**
| Handler | Description |
|---------|------------|
| `set` | Intercepts key-value assignments (`map.set(key, value)`) |
| `delete` | Intercepts deletions (`map.delete(key)`) |
| `clear` | Intercepts `map.clear()` |
| `get`, `has`, `forEach` | Intercepts respective operations |
| `defaultAction` | Called for any unhandled operations |

Example:
```typescript
const map = createObservableMap(new Map(), {
    set: (target, key, value) => {
        console.log(`Setting ${key} to ${value}`);
        return true;
    }
});
map.set("a", 42); // Logs: "Setting a to 42"
```

### **Handlers for Sets**
| Handler | Description |
|---------|------------|
| `add` | Intercepts additions (`set.add(value)`) |
| `delete` | Intercepts deletions (`set.delete(value)`) |
| `clear` | Intercepts `set.clear()` |
| `has`, `forEach` | Intercepts respective operations |
| `defaultAction` | Called for any unhandled operations |

Example:
```typescript
const set = createObservableSet(new Set(), {
    add: (target, value) => {
        console.log(`Added value: ${value}`);
        return true;
    }
});
set.add(99); // Logs: "Added value: 99"
```

## The `extra` Parameter

All handlers receive an **optional `extra` parameter**, which allows developers to pass **context information** into handlers.

Example:
```typescript
const handlers = {
    set: (target, key, value, extra) => {
        console.log(`[${extra.user}] Setting ${String(key)} to ${value}`);
        return true;
    }
};

const obj = createObservableObject({ name: "Alice" }, handlers, true, { user: "admin" });
obj.name = "Bob"; // Logs: "[admin] Setting name to Bob"
```

## Next Steps

To dive deeper into AelasticS-Observables, check out:

➡ **[API Reference](./api/api-overview.md)** – Learn about function signatures and parameters.  
➡ **[Advanced Topics](./advanced/extending-handlers.md)** – Customizing and extending observability.  
