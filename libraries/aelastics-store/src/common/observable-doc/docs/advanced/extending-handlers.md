# Extending Handlers

## Introduction

AelasticS-Observables provides built-in handlers for managing observability of objects, arrays, maps, and sets. However, you can **extend handlers** to customize behavior and apply additional logic, such as **logging, validation, access control, or state tracking**.

## Customizing Handlers

### **1️⃣ Adding Logging to Observables**
You can wrap existing handlers with custom logic to log changes.

```typescript
import { createObservableObject } from 'aelastics-observables';

const handlers = {
    set: (target, key, value) => {
        console.log(`Property '${String(key)}' changed to ${value}`);
        return true; // Allow mutation
    },
    delete: (target, key) => {
        console.log(`Property '${String(key)}' deleted`);
        return true;
    }
};

const obj = createObservableObject({ name: "Alice" }, handlers);
obj.name = "Bob"; // Logs: "Property 'name' changed to Bob"
delete obj.name; // Logs: "Property 'name' deleted"
```

### **2️⃣ Adding Validation to Objects**
Prevent modifications unless certain conditions are met.

```typescript
const handlers = {
    set: (target, key, value) => {
        if (key === "age" && value < 0) {
            console.warn("Age cannot be negative!");
            return false; // Block mutation
        }
        return true;
    }
};

const obj = createObservableObject({ age: 25 }, handlers);
obj.age = -5; // Logs: "Age cannot be negative!" and blocks the update
```

### **3️⃣ Role-Based Access Control (RBAC)**
Allow property modification only for specific users.

```typescript
const handlers = {
    set: (target, key, value, extra) => {
        if (extra?.role !== "admin") {
            console.warn("Permission denied!");
            return false;
        }
        return true;
    }
};

const obj = createObservableObject({ setting: "default" }, handlers, true, { role: "guest" });
obj.setting = "new"; // Logs: "Permission denied!" and blocks mutation
```

### **4️⃣ Intercepting Methods in Objects**
Modify or block method execution.

```typescript
const handlers = {
    method: (target, key, args) => {
        console.log(`Method '${String(key)}' was called with arguments:`, args);
        return true;
    }
};

const obj = createObservableObject({
    greet: (name) => `Hello, ${name}!`
}, handlers);

console.log(obj.greet("Alice")); // Logs: "Method 'greet' was called with arguments: ['Alice']"
```

## Extending Handlers for Collections

### **Extending Array Handlers**
```typescript
const handlers = {
    push: (target, items) => {
        console.log(`Adding ${items.length} items to the array.`);
        return true;
    }
};

const arr = createObservableArray([], handlers);
arr.push(10, 20); // Logs: "Adding 2 items to the array."
```

### **Extending Map Handlers**
```typescript
const handlers = {
    set: (target, key, value) => {
        console.log(`Map key '${key}' set to '${value}'`);
        return true;
    }
};

const map = createObservableMap(new Map(), handlers);
map.set("a", 100); // Logs: "Map key 'a' set to '100'"
```

## Summary

- Handlers allow **customization of observables**.
- Can be used for **logging, validation, security, and method interception**.
- Extend behavior for **objects, arrays, maps, and sets**.

## Next Steps

➡ **[Performance Optimizations](./performance.md)** – Learn best practices for improving efficiency.  
➡ **[Integration](./integration.md)** – Using observables with frameworks like React and Vue.  
