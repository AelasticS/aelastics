# @aelastics/eternal

`@aelastics/eternal` is a UUID-based immutable store designed for managing objects with support for **cyclic structures**, **bidirectional associations**, and **state versioning**. It ensures **efficient updates**, **structural integrity**, and **referential consistency**.

## 📖 Documentation Overview
- [Concepts & Architecture](./concepts.md)
- [Using produce()](./produce.md)
- [Undo & Redo](./undo-redo.md)
- [React Integration](./react-integration.md)
- [State Navigation & Object Freezing](./state-navigation.md)

---

## 🚀 Quick Start

```typescript
import { Store } from "@aelastics/eternal";

const store = new Store();

const user = store.createObject("User");
store.produce((u) => {
    u.name = "Alice";
}, user);

console.log(user.name); // Alice
```

For more details, check the full documentation.

---

## 📌 Learn More
- [API Reference](./api.md)
- [Examples & Use Cases](./examples.md)
