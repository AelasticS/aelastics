# Validation Rules

## Overview

The **Type Schema System** applies strict validation rules to ensure schema correctness and integrity.

### **Schema Validation Rules**
✔ **Schemas must exist before being referenced.**  
✔ **No two schemas can export the same type or role.**  
✔ **Circular dependencies in imports are disallowed.**  
✔ **Imported types/roles must exist in the source schema.**  
✔ **Versioning rules must be correctly followed.**  

### **Property Validation**
✔ **Type references must be valid.**  
✔ **Bidirectional relationships must be consistent.**  
✔ **Min/max constraints must be valid (`minElements <= maxElements`).**  

Violating these rules results in schema rejection.