# Getting Started

Welcome to **AelasticS-Observables**! This guide will help you quickly set up and start using the library.

## Installation

To install AelasticS-Observables, use **npm** or **yarn**:

```sh
# Using npm
npm install aelastics-observables

# Using yarn
yarn add aelastics-observables
```

## Basic Usage

### 1️⃣ Creating an Observable Object
Use `createObservableObject` to make an object reactive.

```typescript
import { createObservableObject } from 'aelastics-observables';

const obj = createObservableObject({ count: 0 }, {
    set: (target, key, value) => {
        console.log(`Property ${String(key)} changed to ${value}`);
        return true;
    }
});

obj.count = 42; // Logs: "Property count changed to 42"
```

### 2️⃣ Creating an Observable Array
Use `createObservableArray` to observe changes to an array.

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

### 3️⃣ Creating an Observable Map
Use `createObservableMap` to track modifications in a `Map`.

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

### 4️⃣ Creating an Observable Set
Use `createObservableSet` to monitor changes in a `Set`.

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

## Next Steps

To learn more, explore the following guides:

➡ **[Core Concepts](./core-concepts.md)** – Learn how observables and handlers work  
➡ **[API Reference](./api/api-overview.md)** – Detailed function documentation  
➡ **[Advanced Topics](./advanced/extending-handlers.md)** – Customize observables with custom handlers  
