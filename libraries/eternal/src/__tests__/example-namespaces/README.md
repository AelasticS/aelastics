Summary of Created Namespaces:

  1. Company Namespace (/company)

  - Features: Basic object types, all cardinalities of bidirectional relationships
  - Relationships:
    - One-to-One: Employee ↔ Badge
    - One-to-Many: Company ↔ Employees
    - Many-to-Many: Employee ↔ Projects
  - Collections: Arrays, Sets
  - Roles: Auditable, Timestampable, Versionable

  2. Auth Namespace (/auth)

  - Features: Inheritance, specific imports with aliases
  - Inheritance: AdminUser, GuestUser extend User
  - Relationships: One-to-one (User ↔ Session), One-to-many (AdminUser ↔ Permissions)
  - Import Pattern: Specific with alias: ["/company", [{ original: "Address", alias: "CompanyAddress" }]]
  - Roles: Auditable, Timestampable, Versionable

  3. Ecommerce Namespace (/ecommerce)

  - Features: All collection types, wildcard imports, complex relationships
  - Collections: Array, Set, Map, Record
  - Relationships: Customer ↔ Orders, Product ↔ OrderItems, Order ↔ OrderItems
  - Import Pattern: Wildcard: ["/company", ["*"]]
  - Roles: Auditable, Timestampable, Versionable

  4. Core Namespace (/core)

  - Features: Role definitions for the type system
  - Role Types: AuditableRole, TimestampableRole, VersionableRole, SoftDeletableRole
  - Purpose: Provides role structure definitions used by other namespaces

  5. Educational Namespace (/educational)

  - Features: Mixed imports, complex many-to-many relationships, inheritance from imported types
  - Relationships: Many-to-many (Student ↔ Courses), One-to-many (Teacher ↔ Courses)
  - Inheritance: Teacher extends imported BaseUser
  - Import Pattern: Mixed: ["/auth", ["*", { original: "User", alias: "BaseUser" }]]
  - Collections: All types including GradeMap

  Key Features Demonstrated:

  ✅ Bidirectional Relationships: All cardinalities (1:1, 1:N, N:M) with proper inverseProp, inverseTypeRef,
   and inverseType metadata
  ✅ Direct Object References: No foreign key IDs - direct object references
  ✅ All Collection Types: Array, Set, Map, Record
  ✅ Inheritance: Multiple levels with extends property
  ✅ Import Patterns: Specific, wildcard, aliased, and mixed imports
  ✅ Role System: Role definitions and usage in entity types
  ✅ System Types: Automatic use of system namespace primitives (string, number, boolean, date)
  ✅ Optional/Required Properties: Proper optional flag usage
  ✅ Identity Keys: Entity types with identityKeys property
  ✅ Qualified Names: All qNames follow /namespace/Type format

  These examples can be used in beforeEach blocks in test files to create comprehensive registries and
  stores for testing all functionality of the eternal type system