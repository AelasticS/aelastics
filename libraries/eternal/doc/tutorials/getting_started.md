---
id: getting_started
title: Getting Started
sidebar_label: Getting Started
---

# Getting Started with @aelastics/eternal

## 🔹 Installation
```bash
npm install @aelastics/eternal
```

## 🔹 Creating an Immutable Store
```typescript
import { Store } from "@aelastics/eternal";

const store = new Store();
```

## 🔹 Creating & Modifying Objects
```typescript
const user = store.createObject("User");
user.name = "Alice";

store.produce((draft) => {
    draft.name = "Bob"; // Creates a new version of user
}, user);
```

## 🔹 Using Undo/Redo
```typescript
store.undo(); // Reverts to previous state
store.redo(); // Reapplies undone change
```
