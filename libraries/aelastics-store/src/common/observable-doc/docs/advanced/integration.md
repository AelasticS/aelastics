# Integration with Frameworks

## Introduction

AelasticS-Observables can be easily integrated with modern frontend frameworks like **React**, **Vue**, and **Svelte**. This guide covers best practices for using observables efficiently in UI-driven applications.

## Using AelasticS-Observables with React

React relies on **state immutability**, so when working with observables, you need to ensure **React updates properly**.

### **1️⃣ Using Observables in React State**

Since observables update properties directly, React **might not re-render automatically**. To force updates, you can use the `useState` or `useReducer` hook.

```typescript
import React, { useState } from "react";
import { createObservableObject } from "aelastics-observables";

const Counter = () => {
    const [, forceUpdate] = useState(0);

    const counter = createObservableObject({ count: 0 }, {
        set: () => {
            forceUpdate(prev => prev + 1); // Forces React to re-render
            return true;
        }
    });

    return (
        <div>
            <p>Count: {counter.count}</p>
            <button onClick={() => counter.count++}>Increment</button>
        </div>
    );
};

export default Counter;
```

### **2️⃣ Using Observables with React Context**

You can store observable objects inside a **React Context** to provide **global state management**.

```typescript
import React, { createContext, useContext } from "react";
import { createObservableObject } from "aelastics-observables";

const CounterContext = createContext(null);

const CounterProvider = ({ children }) => {
    const counter = createObservableObject({ count: 0 }, {});
    return <CounterContext.Provider value={counter}>{children}</CounterContext.Provider>;
};

const Counter = () => {
    const counter = useContext(CounterContext);
    return (
        <div>
            <p>Count: {counter.count}</p>
            <button onClick={() => counter.count++}>Increment</button>
        </div>
    );
};

export default function App() {
    return (
        <CounterProvider>
            <Counter />
        </CounterProvider>
    );
}
```

---

## Using AelasticS-Observables with Vue

Vue provides **reactive state management** with `ref` and `reactive()`. **AelasticS-Observables** can be integrated as a replacement.

### **1️⃣ Creating a Reactive Object in Vue**

```typescript
import { createObservableObject } from "aelastics-observables";
import { ref } from "vue";

export default {
    setup() {
        const state = createObservableObject({ count: 0 }, {});
        return { state };
    }
};
```

### **2️⃣ Using Observables in Vue Components**

```vue
<template>
  <div>
    <p>Count: {{ state.count }}</p>
    <button @click="state.count++">Increment</button>
  </div>
</template>

<script>
import { createObservableObject } from "aelastics-observables";

export default {
  setup() {
    const state = createObservableObject({ count: 0 }, {});
    return { state };
  }
};
</script>
```

---

## Using AelasticS-Observables with Svelte

Svelte has a built-in **reactive store system**, but you can also use AelasticS-Observables.

### **1️⃣ Creating an Observable Store**

```typescript
import { createObservableObject } from "aelastics-observables";

export const state = createObservableObject({ count: 0 }, {});
```

### **2️⃣ Using the Observable in a Svelte Component**

```svelte
<script>
  import { state } from "./store.js";
</script>

<p>Count: {state.count}</p>
<button on:click={() => state.count++}>Increment</button>
```

---

## Summary

✔ **React** → Use `useState` or Context API to trigger re-renders.  
✔ **Vue** → Use inside `setup()` with Vue's reactivity system.  
✔ **Svelte** → Works seamlessly as a store replacement.  

## Next Steps

➡ **[Extending Handlers](./extending-handlers.md)** – Customizing handlers for advanced use cases.  
➡ **[Performance Optimizations](./performance.md)** – Improve performance with best practices.  
