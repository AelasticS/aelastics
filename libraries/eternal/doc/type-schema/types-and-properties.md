# Types & Properties

## Overview

In the **Type Schema System**, objects are defined using **types** that consist of structured properties. Properties define the **data structure**, enforce **relationships**, and apply **constraints** (e.g., cardinalities, default values).

Each **type** is uniquely identified by its **qualified name (`qName`)** and belongs to a **schema**.

---

## Defining Object Types

A **type** consists of:
- A **qualified name (`qName`)** for uniqueness.
- A **set of properties** defining the object's structure.
- An **optional base type (`extends`)** for inheritance.

Example:
```json
{
  "qName": "/customer/Order",
  "properties": {
    "/customer/Order/id": { "type": "string" },
    "/customer/Order/total": { "type": "number" },
    "/customer/Order/customer": { "type": "object", "inverseType": "/customer/Customer" }
  },
  "extends": "/core/Entity"
}
