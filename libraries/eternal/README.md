# `@aelastics/eternal`

## Overview

`@aelastics/eternal` is an immutable store designed for managing immutable objects with support for **cyclic structures** and **bidirectional associations**. It provides a **functional, efficient, and scalable** solution for **immutable state management**, ensuring **structural integrity and referential consistency**.

## Features

- **Immutable Objects** – Objects are immutable instances, updated via `produce(currentState, recipe) => nextState`.
- **Cyclic Structure Support** – Objects can reference each other while maintaining consistency.
- **Bidirectional Associations** – Supports inverse relationships while ensuring referential integrity.
- **Store & Object Management** – Efficiently manages object versions, retrieval, and traversal.
- **Lazy Loading & External Object Integration** – Supports dynamic fetching of missing objects.
- **Serialization & Validation** – Enables object persistence and validation based on schemas.
- **Change Tracking** – Records modifications at the state level with history tracking and undo/redo functionality.

## Installation

```sh
npm install @aelastics/eternal
```

## Usage
### Creating Immutable Objects
```typescript
import { produce } from '@aelastics/eternal';

const initialState = {
  user: { id: '1', name: 'Alice' }
};

const nextState = produce(initialState, draft => {
  draft.user.name = 'Bob';
});

console.log(initialState.user.name); // Alice
console.log(nextState.user.name); // Bob
```
### Change Tracking
```typescript
const state = produce(initialState, draft => {
  draft.user.age = 30;
});

console.log(state.getChangeLog());
// [{ type: 'update', object: 'user', property: 'age', oldValue: undefined, newValue: 30 }]
```
## License
MIT

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.