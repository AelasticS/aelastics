# API: `createObservableArray`

## Function Signature

```typescript
function createObservableArray<T, P extends {} = {}>(
    arr: T[],
    handlers: ArrayHandlers<T, P>,
    defaultMutation?: boolean,
    extra?: P
): T[];
```

## Parameters

| Name             | Type                     | Default | Description |
|-----------------|-------------------------|---------|-------------|
| `arr`           | `T[]`                     | —       | The array to make observable |
| `handlers`      | `ArrayHandlers<T, P>`     | `{}`    | Custom handlers for operations |
| `defaultMutation` | `boolean`              | `true`  | Whether to allow default mutations |
| `extra`         | `P (optional)`           | `{}`    | Additional context for handlers |

## Handlers

| Handler          | Description |
|-----------------|------------|
| `set`          | Called when setting an item (`arr[index] = value`) |
| `delete`       | Called when deleting an item (`delete arr[index]`) |
| `push`        | Called when pushing new elements (`arr.push(value)`) |
| `pop`         | Called when popping an element (`arr.pop()`) |
| `shift`       | Called when shifting an element (`arr.shift()`) |
| `unshift`     | Called when unshifting an element (`arr.unshift(value)`) |
| `splice`      | Called when splicing elements (`arr.splice(start, deleteCount, items)`) |
| `reverse`     | Called when reversing the array (`arr.reverse()`) |
| `sort`        | Called when sorting the array (`arr.sort()`) |
| `fill`        | Called when filling the array (`arr.fill(value, start, end)`) |
| `defaultAction` | Called for any unhandled operations |

## Example Usage

### Basic Example

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

### Using `extra` Parameter

```typescript
const handlers = {
    push: (target, items, extra) => {
        console.log(`[${extra.user}] Pushing items: ${items.join(", ")}`);
        return true;
    }
};

const arr = createObservableArray([1, 2, 3], handlers, true, { user: "admin" });
arr.push(4); // Logs: "[admin] Pushing items: 4"
```

## Next Steps

➡ **[Observable Objects](./api-observable-object.md)** – API reference for `createObservableObject`  
➡ **[Observable Maps](./api-observable-map.md)** – API reference for `createObservableMap`  
➡ **[Observable Sets](./api-observable-set.md)** – API reference for `createObservableSet`  
