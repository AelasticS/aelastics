# Working with Immutable Object Versions and State Views

This tutorial will help you understand how to **retrieve objects from different state versions**, manage **fixed vs. dynamic views**, and work efficiently with **historical states**.

---

## Introduction

In `@aelastics/eternal`, objects are immutable and tracked across **different versions of state**.  
You can either:

- **Retrieve the latest version of an object**, which always reflects the current state.
- **Retrieve a fixed version of an object** from a past state, ensuring it remains immutable.

The store manages multiple versions of states, enabling **undo/redo functionality**, **what-if analysis**, and **state history tracking**.

---

## Retrieving Objects from the Store

### Getting the Latest Version (Dynamic View)

By default, when you retrieve an object from the `Store`, it will always reflect the **latest version**.

```typescript
const store = new Store()

// Retrieve a dynamic version of an object
const obj = store.getObject("uuid-123")

console.log(obj.name) // Always shows the latest name
```

This object will automatically reflect changes whenever the state updates.

> **Note:** Updating dynamic objects is done using `produce()`. This is explained in detail in another part of the tutorial.

---

### Getting an Object from a Specific State (Fixed View)

If you need to retrieve an object **from a past state**, you can use `fromState()`. This ensures the object is locked to that historical state.

```typescript
const oldObj = store.fromState(0, "uuid-123")

console.log(oldObj.name) // Shows the name from State 0 (unchanging)
oldObj.name = "New Name" // ❌ Error: Cannot modify a fixed state object
```

**This object remains immutable and will never change, even if the latest state updates.**

---

### Retrieving a Fixed View of an Object

If you already have a reference to an object (either dynamic or fixed), you can retrieve a **fixed version** of it from a past state.

```typescript
const obj = store.getObject("uuid-123")

// Convert to a fixed view from state 1
const oldView = store.fromState(1, obj)

console.log(oldView.name) // Name from state 1
console.log(obj.name) // Latest name
```

**Fixed state objects cannot be modified and do not change over time.**

---

## Understanding Fixed vs. Dynamic Views

| **Method**                          | **Returns**      | **Mutable?**                 | **Tracks Latest State?**                |
| ----------------------------------- | ---------------- | ---------------------------- | --------------------------------------- |
| `store.getObject(uuid)`             | **Dynamic View** | ✅ **Yes (via `produce()`)** | ✅ **Always reflects the latest state** |
| `store.fromState(stateIndex, uuid)` | **Fixed View**   | ❌ **Immutable**             | ❌ **Locked to a historical state**     |

**Dynamic views are great for working with evolving state, while fixed views allow you to analyze past data safely.**

---

## Propagation of Fixed Views

When you access properties inside a **fixed state object**, all referenced objects are also automatically converted into **fixed views**.

```typescript
const parentLatest = store.getObject("uuid-parent")
const parentFixed = store.fromState(0, parentLatest)

console.log(parentFixed.children) // Children are also fixed to State 0
console.log(parentLatest.children) // Children reflect the latest state
```

**This prevents inconsistencies when navigating object hierarchies.**

---

## Preventing Inconsistent State Modifications

Fixed state objects **cannot be modified** and **cannot be assigned as values** in a dynamic state.

```typescript
const latestParent = store.getObject("uuid-parent")
const oldChild = store.fromState(0, "uuid-child")

// ❌ Attempt to modify a fixed object
oldChild.name = "New Name" // Error: Cannot modify a fixed state object

// ❌ Attempt to add a fixed object to a dynamic state
latestParent.children.push(oldChild) // Error: Cannot assign a fixed state object
```

**This prevents corruption of the immutable state history.**

---

## Advanced Example: Comparing Object Versions in React

Imagine you want to **compare an object’s latest state vs. an older version** inside a React component.

```tsx
const ComparisonComponent = ({ uuid }: { uuid: string }) => {
  const store = useStore()

  // Get the latest version (dynamic)
  const latestObj = store.getObject(uuid)

  // Get a fixed version from an older state
  const oldObj = store.fromState(1, uuid)

  return (
    <div>
      <h3>Latest Name: {latestObj?.name}</h3>
      <h3>Name in State 1: {oldObj?.name}</h3>
    </div>
  )
}
```

**This approach allows you to visualize changes over time while keeping the state immutable.**

---

## Summary

- **Use `store.getObject(uuid)`** to get the latest state (**dynamic view**).
- **Use `store.fromState(stateIndex, target)`** to get a past state (**fixed view**).
- **Fixed state objects cannot be modified** and ensure consistent history tracking.
- **All objects inside a fixed view also become fixed**, preventing inconsistencies.
- **React components can display multiple versions of an object at the same time.**
