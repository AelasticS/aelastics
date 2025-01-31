# API: `createObservableMap`

## Function Signature

```typescript
function createObservableMap<K, V, P extends {} = {}>(
    map: Map<K, V>,
    handlers: MapHandlers<K, V, P>,
    defaultMutation?: boolean,
    extra?: P
): Map<K, V>;
```

## Parameters

| Name             | Type                     | Default | Description |
|-----------------|-------------------------|---------|-------------|
| `map`           | `Map<K, V>`               | —       | The map to make observable |
| `handlers`      | `MapHandlers<K, V, P>`    | `{}`    | Custom handlers for operations |
| `defaultMutation` | `boolean`              | `true`  | Whether to allow default mutations |
| `extra`         | `P (optional)`           | `{}`    | Additional context for handlers |

## Handlers

| Handler          | Description |
|-----------------|------------|
| `set`          | Called when setting a key-value pair (`map.set(key, value)`) |
| `delete`       | Called when deleting a key (`map.delete(key)`) |
| `clear`        | Called when clearing all entries (`map.clear()`) |
| `get`          | Called when retrieving a value (`map.get(key)`) |
| `has`          | Called when checking key existence (`map.has(key)`) |
| `forEach`      | Called when iterating over the map (`map.forEach(callback)`) |
| `defaultAction` | Called for any unhandled operations |

## Example Usage

### Basic Example

```typescript
import { createObservableMap } from 'aelastics-observables';

const map = createObservableMap(new Map(), {
    set: (target, key, value) => {
        console.log(`Key ${key} updated to ${value}`);
        return true;
    }
});

map.set('a', 10); // Logs: "Key a updated to 10"
```

### Using `extra` Parameter

```typescript
const handlers = {
    set: (target, key, value, extra) => {
        console.log(`[${extra.user}] Setting key ${key} to ${value}`);
        return true;
    }
};

const map = createObservableMap(new Map(), handlers, true, { user: "admin" });
map.set("b", 20); // Logs: "[admin] Setting key b to 20"
```

## Next Steps

➡ **[Observable Objects](./api-observable-object.md)** – API reference for `createObservableObject`  
➡ **[Observable Arrays](./api-observable-array.md)** – API reference for `createObservableArray`  
➡ **[Observable Sets](./api-observable-set.md)** – API reference for `createObservableSet`  
