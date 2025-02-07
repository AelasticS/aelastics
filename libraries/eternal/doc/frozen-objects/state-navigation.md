# 📜 State Navigation & Object Freezing

## 🔹 Dynamic vs. Frozen Objects

| Object Type | When to Use | Rules |
|------------|------------|--------|
| **Frozen Object** | When accessing a historical state | ❌ Cannot modify, ❌ Cannot access future versions |
| **Dynamic Object** | When working with live state | ✅ Always resolves to latest version, ❌ Cannot access outdated objects |

## ❌ Preventing Incorrect Access
If an outdated object is accessed, an **error is thrown**:
```typescript
const obj = store.getState().getObject("some-uuid", false);
if (obj.nextVersion) {
    throw new Error("Cannot access outdated object. Use the latest version.");
}
```
