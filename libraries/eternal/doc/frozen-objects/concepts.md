# 🏗️ Concepts & Architecture

## 📌 Core Principles
- **Immutable Objects** → Objects are stored immutably, creating a new version when modified.
- **UUID References** → Object relationships are stored using UUIDs, not direct references.
- **Frozen Objects** → Objects can be locked to a historical state for safe access.
- **Version Tracking** → Objects evolve over time, with changes tracked through states.
- **Undo/Redo Support** → State history allows controlled modifications and reversions.

