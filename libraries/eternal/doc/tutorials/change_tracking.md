---
id: change_tracking
title: Change Tracking & JSON Patch
sidebar_label: Change Tracking
---

# Change Tracking & JSON Patch

## 🔹 How Change Tracking Works
Each state keeps a **log of changes**:

- `insert`: Object was created.
- `update`: A property was modified.
- `delete`: Object was removed.

## 🔹 Generating JSON Patch
```typescript
const patch = store.getState().getChangeLog();
console.log(JSON.stringify(patch, null, 2));
```

## 🔹 Applying JSON Patch to Restore State
```typescript
store.applyPatch(patch);
```
