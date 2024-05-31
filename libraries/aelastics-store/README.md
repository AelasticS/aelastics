# Aelastics-store

The `aelastics-store` library is designed to manage immutable state for applications using the `aelastics-types` library. It allows developers to define, manipulate, and manage state models efficiently, ensuring immutability and consistency across state updates.


## Core Features of aelastics-store
| Method          | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `createRoot`      | Initializes the root of the state tree with the given object.               |
| `newObject`       | Creates a new immutable object based on the given type and data.            |
| `getState`        | Retrieves the current state of the store.                                   |
| `produce`         | Applies updates to the state by creating a draft, modifying it, and returning a new state. |
| `clearState`      | Clears the current state, effectively resetting the store.                  |

### Immutable State Management
Immutability is a core principle in state management that ensures the state cannot be modified directly. Instead, any change to the state results in the creation of a new state object. This makes state changes predictable and easier to debug. The aelastics-store library implements immutability by maintaining an immutable copy of the state and providing mechanisms to produce new states through updates.

### State Updates
State updates are performed using a functional approach. When an update is needed, a new state is produced by applying a function to the current state. This function creates a draft of the current state, applies the necessary changes, and then returns a new state with those changes applied, leaving the original state unchanged.

### Managing Relationships
The library efficiently manages bi-directional relationships between entities. When one side of the relationship is updated, the other side is automatically kept in sync. This is crucial for maintaining consistency in complex state models where entities are interconnected.

## Defining State with aelastics-store
The aelastics-store library relies on the type definitions documented in the aelastics-types library. Once you have your types defined, you can use aelastics-store to manage the immutable state of your application.


## Usage example
### Creating and managing state

```ts
import * as t from "aelastics-types"
import { ImmutableStore } from "aelastics-store"
import { ImmutableObject, objectStatus } from "aelastics-types/common/CommonConstants"
import { StatusValue } from "aelastics-types/common/Status"

// Assume the schema and types are defined using aelastics-types library

// Define initial state
const initStudent = {
  id: "1",
  name: "student1",
  tutor: undefined,
}

// Create an ImmutableStore instance
const immutableStore = new ImmutableStore(StudentType)
const student = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
const oldState = immutableStore.getState()

// Update the state
const newState = immutableStore.produce((draft) => {
  draft.name = "new student name"
})

// Check immutability
console.assert(oldState !== newState)
console.assert(oldState.name === "student1")
console.assert(newState.name === "new student name")
```

### Managing Nested State
Updates to nested objects also produce new states, ensuring the entire state tree remains immutable.
```ts
const tt = immutableStore.newObject(TutorType, { id: "2", name: "tutor1" }, "2")
student.tutor = tt
student[objectStatus] = StatusValue.Unmodified
tt[objectStatus] = StatusValue.Unmodified
const oldState = immutableStore.getState()

const newState = immutableStore.produce((draft) => {
  draft.tutor.name = "new tutor name"
})

console.assert(oldState !== newState)
console.assert(oldState.tutor.name === "tutor1")
console.assert(oldState.tutor !== newState.tutor)
console.assert(newState.tutor.name === "new tutor name")
```

### Handling cyclic relationships
The library handles cyclic relationships between entities efficiently, ensuring that updates propagate correctly through the entire state graph.
```ts
const student = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
student[objectStatus] = StatusValue.Unmodified
const oldState = immutableStore.getState()

const tt = immutableStore.newObject(TutorType, { id: "2", name: "tutor1" }, "2")
immutableStore.produce((draft) => {
  draft.tutor = tt
})

const zz = immutableStore.newObject(StudentType, { id: "3", name: "student2" }, "3")
immutableStore.produce((draft) => {
  draft.tutor.tutee2 = zz
})

const newState = immutableStore.getState()

console.assert(newState.tutor !== oldState.tutor)
console.assert(newState.tutor.tutee2 !== oldState.tutor.tutee2)
console.assert(newState.tutor.tutee !== oldState.tutor.tutee)
console.assert(newState !== oldState)
```

### Bi-Directional Relationship Consistency
Updates to one side of a bi-directional relationship automatically reflect on the other side, maintaining consistency.
```ts
const student = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
let tutor

immutableStore.produce((draft) => {
  tutor = immutableStore.newObject(TutorType, { id: "2", name: "tutor1", tutee: draft })
})

const updatedTutee = immutableStore.getState()
const updatedTutor = updatedTutee.tutor

console.assert(updatedTutee.tutor === tutor)
console.assert(updatedTutor.tutee === updatedTutee)
```

The aelastics-store library provides a robust solution for managing immutable state in applications. By leveraging the power of immutability and efficient state updates, it ensures that application state remains consistent and easy to manage, even in complex scenarios involving nested and bi-directional relationships.