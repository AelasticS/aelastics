---
id: immutability
title: Immutable Objects & State Management
sidebar_label: Immutability
---

# Immutable Objects & State Management

## 🔹 How Immutability Works
`@aelastics/eternal` enforces **deep immutability** where objects **cannot be modified** outside of a controlled update session.

- Every object is assigned a **UUID**.
- Updates are applied via `produce()`, ensuring **a new state is created** while preserving structural sharing.

## 🔹 Handling Object Versions
- Objects **persist across states** until modified.
- When an object is updated, a **new version** is stored in the active state.
- **Old versions remain accessible** in historical states.

## 🔹 Tracking Changes & State History
- The framework keeps a **log of modifications** (`insert`, `update`, `delete`).
- Undo/Redo is enabled via **state history navigation**.
