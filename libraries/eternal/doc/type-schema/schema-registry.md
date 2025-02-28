# Schema Registry

## Overview

The **Schema Registry** is the central repository that organizes and manages schemas in the **Type Schema System**. It allows schemas to be structured hierarchically, ensuring modularity, reusability, and strong validation rules.

Schemas in the registry:
- Contain **types** (structured entities with properties).
- Define **roles** that dynamically modify object behaviors.
- Support **modular imports and exports**, allowing cross-schema reuse.
- Can be **versioned**, ensuring compatibility between different schema versions.

---

## Schema Structure

Each schema in the registry follows a **structured format**, containing:
- **QName** (`qName`): Fully qualified name of the schema (e.g., `/customer/orders`).
- **Version** (`version`): Unique version number for schema versioning.
- **Types** (`types`): A collection of object types with their properties.
- **Roles** (`roles`): A collection of roles that define additional behaviors.
- **Exports** (`export`): A list of types/roles that this schema makes available to others.
- **Imports** (`import`): A mapping of schemas that this schema depends on.

Example schema definition:
```json
{
  "qName": "/customer/orders",
  "version": "1.0",
  "types": {
    "/customer/orders/Invoice": {
      "qName": "/customer/orders/Invoice",
      "properties": {
        "/customer/orders/Invoice/amount": { "type": "number" },
        "/customer/orders/Invoice/customer": { "type": "object", "inverseType": "/customer/Customer" }
      }
    }
  },
  "roles": {
    "/customer/orders/Paid": {
      "qName": "/customer/orders/Paid",
      "type": "/core/Status"
    }
  },
  "export": ["/customer/orders/Invoice", "/customer/orders/Paid"],
  "import": {
    "/customer": ["/customer/Customer"]
  }
}
