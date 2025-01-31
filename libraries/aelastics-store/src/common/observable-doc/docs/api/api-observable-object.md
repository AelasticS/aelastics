# API: `createObservableObject`

## Function Signature

```typescript
function createObservableObject<T extends object, P extends {} = {}>(
    obj: T,
    handlers: ObjectHandlers<T, P>,
    defaultMutation?: boolean,
    extra?: P
): T;
```

## Parameters

| Name             | Type                     | Default | Description |
|-----------------|-------------------------|---------|-------------|
| `obj`           | `T`                       | —       | The object to make observable |
| `handlers`      | `ObjectHandlers<T, P>`    | `{}`    | Custom handlers for operations |
| `defaultMutation` | `boolean`              | `true`  | Whether to allow default mutations |
| `extra`         | `P (optional)`           | `{}`    | Additional context for handlers |

## Handlers

| Handler          | Description |
|-----------------|------------|
| `set`          | Called when setting a property (`obj.key = value`) |
| `delete`       | Called when deleting a property (`delete obj.key`) |
| `method`       | Called when invoking a function on the object (`obj.method()`) |
| `defaultAction` | Called for any unhandled operations |

## Example Usage

### Basic Example

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

### Using `extra` Parameter

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

➡ **[Observable Arrays](./api-observable-array.md)** – API reference for `createObservableArray`  
➡ **[Observable Maps](./api-observable-map.md)** – API reference for `createObservableMap`  
➡ **[Observable Sets](./api-observable-set.md)** – API reference for `createObservableSet`  
