# Introduction

## What is AelasticS-Observables?

**AelasticS-Observables** is a JavaScript/TypeScript library that provides **observable data structures** using the Proxy API. It allows developers to track changes to objects, arrays, maps, and sets efficiently while maintaining a **clean and declarative API**.

## Why Use AelasticS-Observables?

Managing state changes in JavaScript applications often requires deep tracking mechanisms. **AelasticS-Observables** simplifies this by:
- Automatically **tracking modifications** to structured data types.
- Providing **customizable handlers** for intercepting actions (`set`, `delete`, `push`, etc.).
- Offering an **optional `extra` context parameter** for passing metadata.
- Supporting **fine-grained control** over mutation behavior.
- Being **lightweight** and compatible with modern JavaScript/TypeScript.

## Key Features

✔ **Observable Objects, Arrays, Maps, and Sets**  
✔ **Customizable Handlers for State Modifications**  
✔ **Efficient Proxy-based Observability**  
✔ **Optional `extra` Metadata Parameter**  
✔ **Works Seamlessly with TypeScript**  

## How AelasticS-Observables Works

The library wraps objects and collections with **Proxies**, allowing interception of:
- **Property modifications** (e.g., `obj.name = "Alice"`)
- **Method calls** (e.g., `array.push(42)`)
- **Deletions** (e.g., `delete obj.name`)
- **Collection updates** (e.g., `map.set("key", "value")`)

## Supported Observable Structures

| Data Structure | Function Implemented | Supported Handlers |
|---------------|---------------------|----------------------|
| **Objects**  | `createObservableObject` | `set`, `delete`, `method`, `defaultAction` |
| **Arrays**   | `createObservableArray`  | `set`, `delete`, `push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `sort`, `fill`, `defaultAction` |
| **Maps**     | `createObservableMap`    | `set`, `delete`, `clear`, `get`, `has`, `forEach`, `defaultAction` |
| **Sets**     | `createObservableSet`    | `add`, `delete`, `clear`, `has`, `forEach`, `defaultAction` |

## Example Usage

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

## Next Steps

To get started with **AelasticS-Observables**, continue with the following guides:

➡ **[Getting Started](./getting-started.md)** – Install and set up the library  
➡ **[Core Concepts](./core-concepts.md)** – Learn about proxies and handlers  
➡ **[API Reference](./api/api-overview.md)** – Explore detailed function documentation  
➡ **[Advanced Topics](./advanced/extending-handlers.md)** – Extend observability for custom use cases  
