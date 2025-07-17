/**
 * Example Namespaces for Testing
 * 
 * This module provides comprehensive example namespaces that demonstrate all features
 * of the eternal type system as described in TYPE_SYSTEM.md
 * 
 * Features Demonstrated:
 * - Basic object types and entities
 * - All collection types (Array, Set, Map, Record)
 * - Bidirectional relationships with all cardinalities:
 *   - One-to-One (Employee ↔ Badge)
 *   - One-to-Many (Company ↔ Employees, Course ↔ Students)
 *   - Many-to-Many (Employee ↔ Projects, Student ↔ Courses)
 * - Inheritance (AdminUser, GuestUser extend User; Teacher extends User)
 * - Import patterns:
 *   - Specific imports: ["/core", ["AuditableRole", "TimestampableRole"]]
 *   - Wildcard imports: ["/company", ["*"]]
 *   - Aliased imports: ["/auth", [{ original: "User", alias: "BaseUser" }]]
 *   - Mixed imports: ["/auth", ["*", { original: "User", alias: "BaseUser" }]]
 * - Role system (Auditable, Timestampable, Versionable, SoftDeletable)
 * - Optional and required properties
 * - Identity keys for entities
 * - System namespace auto-import (string, number, boolean, date, etc.)
 */

// Export all example namespaces
export { companyNamespace } from "./company-namespace";
export { authNamespace } from "./auth-namespace";
export { ecommerceNamespace } from "./ecommerce-namespace";
export { coreNamespace } from "./core-namespace";
export { educationalNamespace } from "./educational-namespace";
export { subtypeExamplesNamespace } from "./subtype-examples-namespace";

// Export namespace array for easy iteration in tests
export const allExampleNamespaces = [
    "companyNamespace",
    "authNamespace", 
    "ecommerceNamespace",
    "coreNamespace",
    "educationalNamespace",
    "subtypeExamplesNamespace"
] as const;

/**
 * Suggested import order for testing:
 * 1. coreNamespace - provides role definitions
 * 2. companyNamespace - basic types with bidirectional relationships
 * 3. subtypeExamplesNamespace - demonstrates SubtypeTypeMeta vs inheritance
 * 4. authNamespace - inheritance and specific imports
 * 5. ecommerceNamespace - wildcard imports and all collection types
 * 6. educationalNamespace - mixed imports and complex many-to-many relationships
 */
export const suggestedImportOrder = [
    "coreNamespace",
    "companyNamespace", 
    "subtypeExamplesNamespace",
    "authNamespace",
    "ecommerceNamespace",
    "educationalNamespace"
] as const;