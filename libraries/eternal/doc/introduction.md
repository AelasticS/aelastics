---
id: introduction
title: Introduction to @aelastics/eternal
sidebar_label: Introduction
---

# Introduction to @aelastics/eternal

`@aelastics/eternal` is an immutable object store designed for applications requiring efficient state management, deep immutability, and historical tracking. It supports:

- **Immutable Objects** with structural sharing.
- **Cyclic Structures & Bidirectional Associations**.
- **Versioned State History** with Undo/Redo.
- **Change Tracking & JSON Patch Generation**.
- **Lazy Loading & Observable Collections**.

This documentation will guide you through the **concepts, API, and usage** of the framework.

---

## Key Features

### 🔹 Immutable Object Storage
- Objects are uniquely identified by **UUIDs**.
- All properties are **immutable** and only modified via `produce()`.
- Collections (`arrays`, `sets`, `maps`) are **observable**.

### 🔹 State Versioning & Undo/Redo
- Each **state is stored in history** and can be navigated via `undo()` and `redo()`.
- Objects **automatically resolve to the correct version** in the active state.

### 🔹 Change Tracking & JSON Patch
- Every modification is **logged and can be converted into JSON Patch** for syncing with databases.
- Change history can be **queried from object creation to the latest state**.

### 🔹 Cyclic References & Bidirectional Associations
- Supports **one-to-one, one-to-many, and many-to-many** relationships.
- Objects resolve references **dynamically** based on the current state.

