# Versioning & Lifecycle

## Overview

The **Type Schema System** provides a flexible versioning model for objects, roles, and schemas. It ensures that changes can be managed without breaking compatibility.

Versioning can be applied at different levels:
- **Objects can have versions** where roles remain unchanged.
- **Roles can have versions** independent of objects.
- **Both objects and roles can version together**.

A **special predefined role, `Versionable`,** determines versioning behavior dynamically.

## Object Lifecycle

Objects follow a defined lifecycle:
1️⃣ **Created** → A new object instance is introduced.  
2️⃣ **Modified** → Properties or roles are updated.  
3️⃣ **Versioned** → A new version is created due to changes.  
4️⃣ **Soft Deleted** → The object is marked as deleted but remains in history.  
5️⃣ **Permanently Deleted** → The object is fully removed.  

Roles follow the same lifecycle if `isVersionable = true`.