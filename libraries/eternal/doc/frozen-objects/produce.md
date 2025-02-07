# 🔄 Using `produce()`

The `produce()` function enables controlled modifications to objects while ensuring immutability.

## ✅ Correct Usage
```typescript
const updatedUser = store.produce((user) => {
    user.name = "Bob";
}, user);

setState(updatedUser); // Always update React state!
```
