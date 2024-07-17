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
The library provides bi-directional relationship management between entities. When one side of the relationship is updated, the other side is automatically kept in sync. This is crucial for maintaining consistency in complex state models where entities are interconnected.

## Defining State with aelastics-store
The `aelastics-store` library relies on the type definitions documented in the `aelastics-types` library. Once you have your types defined, you can use aelastics-store to manage the immutable state of your application.


## Usage example
### Type definition assumptions
The following example assumes that the entities and relationships below have been previously defined using the `aelastics-types` library.
```ts
import * as t from "aelastics-types"

// Assume the UniversitySchema is already defined using aelastics-types library.
const StudentType = t.entity(
  {
    id: t.string,
    name: t.string,
    tutor: t.optional(t.link(UniversitySchema, "Tutor", "TutorType")),
  },
  ["id"],
  "Student",
  UniversitySchema
)

const TutorType = t.entity(
  {
    id: t.string,
    name: t.string,
    tutee: t.optional(t.link(UniversitySchema, "Tutee", "StudentType")),
  },
  ["id"],
  "Tutor",
  UniversitySchema
)

// Define the inverse properties for the university domain
t.inverseProps(StudentType, "tutor", TutorType, "tutee")

// Define the interface types for the university domain
type IStudentType = t.TypeOf<typeof StudentType> 
type ITutorType = t.TypeOf<typeof TutorType>
```

### Creating state
```ts
import { ImmutableStore } from "aelastics-store"
import { ImmutableObject, objectStatus } from "aelastics-types/common/CommonConstants"
import { StatusValue } from "aelastics-types/common/Status"


// Define initial state
const initStudent: IStudentType = {
  id: "1",
  name: "student1",
  tutor: undefined,
}

// Create an ImmutableStore instance
const immutableStore = new ImmutableStore(StudentType)
const student = immutableStore.createRoot(initStudent, "1")
```

### Simple updates
```ts
const newState = immutableStore.produce((draft) => {
  draft.name = "new student name"
})
```

### Nested updates
Updates to nested objects also produce new states, ensuring the entire state tree remains immutable.
```ts
const newState = immutableStore.produce((draft) => {
  const tt = immutableStore.newObject(TutorType, { id: "2", name: "tutor1" }, "2")
  draft.tutor = tt
  draft.tutor.name = "new tutor name"
})
```

### Handling cyclic relationships
The library handles cyclic relationships between entities, ensuring that updates propagate correctly through the entire state graph.
```ts
immutableStore.produce((draft) => {
  draft.tutor.tutee.name = "new tutee name"
})
```

### Bi-Directional Relationship Consistency
Updates to one side of a bi-directional relationship automatically reflect on the other side, maintaining consistency.

The aelastics-store library provides a robust solution for managing immutable state in applications. By leveraging the power of immutability and efficient state updates, it ensures that application state remains consistent and easy to manage, even in complex scenarios involving nested and bi-directional relationships.