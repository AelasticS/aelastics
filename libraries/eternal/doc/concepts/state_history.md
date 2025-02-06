---
id: state_history
title: State History & Undo/Redo
sidebar_label: State History
---

# State History & Undo/Redo

## 🔹 How State Versioning Works
Each state is **stored in history**, allowing changes to be undone or redone:

- **Undo (`undo()`)**: Moves back to the previous state.
- **Redo (`redo()`)**: Moves forward to the next state.
- **New changes after an undo remove future states**.

## 🔹 Handling Future Objects
- Objects hold a **Weak Reference (`nextVersion`)** to their next state version.
- If an object **belongs to a future state**, accessing it **throws an error**.

