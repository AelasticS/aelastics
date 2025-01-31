# Performance Optimizations

## Introduction

AelasticS-Observables uses JavaScript Proxies to efficiently track changes in objects, arrays, maps, and sets. However, improper usage can lead to **performance bottlenecks**. This guide covers best practices to **maximize efficiency** when using observables.

## Avoiding Unnecessary Proxies

By default, all properties of an observable object are **not automatically wrapped** in proxies. However, if you wrap deeply nested structures, it may cause **unnecessary overhead**.

✅ **Best Practice:** Wrap only **top-level** objects and collections.

```typescript
const obj = createObservableObject({
    nested: { count: 0 } // Not automatically an observable
}, {});

// Avoid wrapping deeply nested structures if not needed
obj.nested = createObservableObject(obj.nested, {});
```

## Minimize Handler Overhead

Every operation (set, delete, push, etc.) invokes the **corresponding handler**. **Overusing logging or validation** inside handlers can slow down execution.

❌ **Inefficient handler:** Logs on every assignment.
```typescript
const handlers = {
    set: (target, key, value) => {
        console.log(`Setting ${String(key)} to ${value}`);
        return true;
    }
};
```
✅ **Optimized handler:** Logs only when a value **actually changes**.
```typescript
const handlers = {
    set: (target, key, value) => {
        if (target[key] !== value) {
            console.log(`Updated ${String(key)} to ${value}`);
        }
        return true;
    }
};
```

## Using Batch Updates

Instead of making multiple individual updates, **batch updates** can significantly improve performance.

❌ **Slow updates with multiple writes:**
```typescript
arr[0] = 1;
arr[1] = 2;
arr[2] = 3;
```
✅ **Faster batch updates using `.splice()` or `.push()`**:
```typescript
arr.splice(0, 3, 1, 2, 3); // Single operation
```

## Handling Large Collections Efficiently

For large arrays, maps, or sets, frequent operations may become costly.

### Optimizing Large Arrays

✅ **Use methods like `.map()` instead of modifying elements one by one:**
```typescript
observableArr = observableArr.map(item => item * 2);
```

✅ **Prefer `.splice()` over multiple `.push()` calls:**  
```typescript
observableArr.splice(observableArr.length, 0, ...newItems);
```

### Optimizing Large Maps and Sets

✅ **Use batch operations instead of multiple `.set()` or `.add()` calls:**  
```typescript
const entries = [["key1", "value1"], ["key2", "value2"]];
entries.forEach(([key, value]) => observableMap.set(key, value));
```

## Measuring Performance

Use **console.time()** to measure execution time.

```typescript
console.time("Mutation");
for (let i = 0; i < 1000; i++) {
    observableArr.push(i);
}
console.timeEnd("Mutation");
```

## Summary

✔ **Wrap only necessary parts of an object**  
✔ **Minimize heavy handlers like logging**  
✔ **Use batch operations instead of multiple single mutations**  
✔ **Optimize large collections efficiently**  
✔ **Measure performance using `console.time()`**  

## Next Steps

➡ **[Integration](./integration.md)** – Learn how to use AelasticS-Observables with frameworks like React and Vue.  
