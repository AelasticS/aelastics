# Roles & Behaviors

## Overview

In the **Type Schema System**, roles are a **flexible mechanism** for dynamically extending object behavior without modifying their core type. Unlike standard properties, roles:
- Can be **attached and removed dynamically** at runtime.
- Define **behavioral extensions** rather than core structural properties.
- Support **both independent existence and mandatory attachment**.
- Enable **Alfresco-style aspect behavior** through role metadata.

Roles are **not just metadata tags**—they can store **state**, reference **other roles**, and enforce **versioning rules**.

A **role** is a separate concept from a property. While properties define static attributes of an object, roles **describe dynamic characteristics** that can be attached to or removed from an object at runtime. Roles have **their own structure**, which is defined by a specific type.

Example:
```json
{
  "qName": "/customer/orders/Paid",
  "type": "/core/Status",
  "meta": {
    "isMandatory": false,
    "isIndependent": true,
    "autoRemove": false
  }
}
```
✔ The **Paid role** follows a structure defined by `/core/Status`.  
✔ It is **optional** (`isMandatory: false`).  
✔ It can **exist independently** (`isIndependent: true`).  
✔ It is **not removed automatically** (`autoRemove: false`).  