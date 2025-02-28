# Introduction

## Overview

The **Type Schema System** is a flexible and extensible schema model designed to define structured types, properties, and behaviors dynamically. Unlike traditional schema models that impose rigid structures, this system provides:
- **Modular Schema Organization**: Supports importing and exporting types and roles between schemas.
- **Dynamic Role-Based Behaviors**: Roles can be attached and removed at runtime, allowing flexible object behavior extensions.
- **Versioning & Lifecycle Management**: Objects and roles can have independent or synchronized versioning.
- **Strict Schema Validation**: Ensures correctness through bidirectional relationships, subclassing constraints, and property validation.

## Key Features

### ✅ **Modular Schema Registry**
- Schema definitions are stored in a **registry** where they can be **imported, exported, and versioned**.
- Schemas are **namespaced**, with a structured hierarchy supporting **parent-child relationships**.
- Full-path names (e.g., `/customer/orders/Invoice`) uniquely identify schemas and types.

### ✅ **Flexible Type & Property Definitions**
- Supports **primitive types** (`string`, `number`, `boolean`) and **complex types** (`object`, `array`, `map`, `set`).
- **Bidirectional relationships** are explicitly modeled via `inverseType` and `inverseProp`.
- Collection properties (`array`, `set`, `map`) support **min/max constraints** to enforce cardinality.

### ✅ **Dynamic Roles for Object Behavior**
- Unlike traditional schemas, objects can have **roles** that define additional behaviors.
- Roles can be **attached/detached dynamically** unless marked as `isMandatory`.
- Roles can reference **other roles** or be based on **object types** (Alfresco-style aspects).

### ✅ **Advanced Versioning Mechanism**
- **Objects and roles can have independent versioning**:
  - Object versioning without role versioning.
  - Role versioning independent of objects.
  - **Full synchronization mode**, where both object and role versions are updated together.
- A **predefined `Versionable` role** determines versioning behavior per instance.

### ✅ **Schema Validation & Integrity Rules**
- **Catches circular imports** that could lead to infinite loops.
- **Ensures subclassing constraints** prevent cyclic inheritance.
- **Validates bidirectional references** for consistency.
- **Ensures min/max constraints** are correctly defined.

## How It Works

The **Type Schema System** follows a structured approach:
1. **Schemas are registered in a central repository**.
2. **Schemas define types and roles**, which can be imported/exported.
3. **Objects are instantiated based on defined types**.
4. **Roles dynamically extend object behavior**.
5. **Versioning is applied according to predefined rules**.
6. **Validation ensures consistency before execution**.

## Why Use This System?

- **🚀 Extensible**: Add new behaviors dynamically without redefining object types.
- **🔗 Strongly Typed**: Ensures strict relationships between objects.
- **🛠️ Flexible Versioning**: Developers control how object and role versions evolve.
- **⚡ High Integrity**: Schema validation prevents errors before runtime.

---

## Next Steps

To learn more:
- Read about **[Schema Registry](./schema-registry.md)** and how schemas are managed.
- Explore **[Types & Properties](./types-and-properties.md)** to define structured data.
- Understand **[Roles & Behaviors](./roles-and-behaviors.md)** for dynamic object behavior.
- Learn about **[Versioning & Lifecycle](./versioning-and-lifecycle.md)** for object state management.
- See **[Validation Rules](./validation-rules.md)** to ensure schema correctness.
- Check the **[FAQ](./faq.md)** for common questions.

---
