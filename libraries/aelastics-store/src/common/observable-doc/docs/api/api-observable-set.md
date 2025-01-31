# API: `createObservableSet`

## Function Signature

```typescript
function createObservableSet<T, P extends {} = {}>(
    set: Set<T>,
    handlers: SetHandlers<T, P>,
    defaultMutation?: boolean,
    extra?: P
): Set<T>;
```

## Parameters

| Name             | Type                     | Default | Description |
|-----------------|-------------------------|---------|-------------|
| `set`           | `Set<T>`                  | —       | The set to make observable |
| `handlers`      | `SetHandlers<T, P>`       | `{}`    | Custom handlers for operations |
| `defaultMutation` | `boolean`              | `true`  | Whether to allow default mutations |
| `extra`         | `P (optional)`           | `{}`    | Additional context for handlers |

## Handlers

| Handler          | Description |
|-----------------|------------|
| `add`          | Called when adding a value (`set.add(value)`) |
| `delete`       | Called when deleting a value (`set.delete(value)`) |
| `clear`        | Called when clearing all values (`set.clear()`) |
| `has`          | Called when checking value existence (`set.has(value)`) |
| `forEach`      | Called when iterating over the set (`set.forEach(callback)`) |
| `defaultAction` | Called for any unhandled operations |

## Example Usage

### Basic Example

```typescript
import { createObservableSet } from 'aelastics-observables';

const set = createObservableSet(new Set(), {
    add: (target, value) => {
        console.log(`Value ${value} added`);
        return true;
    }
});

set.add(99); // Logs: "Value 99 added"
```

### Using `extra` Parameter

```typescript
const handlers = {
    add: (target, value, extra) => {
        console.log(`[${extra.user}] Adding value: ${value}`);
        return true;
    }
};

const set = createObservableSet(new Set(), handlers, true, { user: "admin" });
set.add(42); // Logs: "[admin] Adding value: 42"
```

## Next Steps

➡ **[Observable Objects](./api-observable-object.md)** – API reference for `createObservableObject`  
➡ **[Observable Arrays](./api-observable-array.md)** – API reference for `createObservableArray`  
➡ **[Observable Maps](./api-observable-map.md)** – API reference for `createObservableMap`  
