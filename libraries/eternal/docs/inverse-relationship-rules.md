# Inverse Relationship Rules & Modeling Guide

This guide explains how to model inverse (bidirectional) relationships in the Eternal registry & store system across Arrays, Sets, and Maps. It documents what is allowed, what is forbidden, and why—so you avoid denormalized or redundant structures. It also summarizes current runtime behaviors (e.g. ordered-set semantics for certain arrays) and provides concrete examples.

---

## Core Principles

1. Inverse relationships exist only to express *entity ↔ entity* (or entity collection) navigation.
2. They must **not** introduce redundant copies of primitive (simple) data.
3. Map-based inverses are only meaningful when the **Map values** are entities. Key-based inverses are not supported.
4. Arrays that participate in inverse relationships behave as **ordered sets** (duplicates filtered out transparently).
5. Prefer **junction entities** for many‑to‑many relationships that carry extra data (grade, role label, timestamp, etc.).

---

## Simple Type Categories

| Category | Examples | Inverse Allowed? |
|----------|----------|------------------|
| Simple (primitive) | `string`, `number`, `boolean` | ❌ No |
| Entity/Object | Registered entity or object types | ✅ Yes |
| Collection (Array / Set / Map) of entities | `/ns/EntityArray`, `/ns/EntitySet`, `Map<SimpleKey, Entity>` | ✅ Yes (rules apply) |
| Collection with simple *values* (e.g. `Map<Entity, number>`) | `Map<Entity, number>` | ❌ If inverse points to another value container |
| Map with simple keys & entity values | `Map<string, Employee>` | ✅ Yes (value-based inverse only) |

---

## Forbidden Patterns (❌) & Rationale

### 1. Simple Property Inverses

```ts
// ❌ Bad: Duplicated primitive data
Employee.name: string  ↔  Department.managerName: string
```

**Why**: Creates two sources of truth for the same immutable value.

### 2. Map KEY-based Inverses

```ts
// ❌ Bad: Key holds the entity; inverse on value side is redundant
Department.employeeGrades: Map<Employee, number>  ↔  Employee.department: Department
```

**Why**: The Employee already supplies the inverse path. Using the entity as a key adds coupling & redundant indexing logic.

### 3. Map with Simple VALUE Inverse (Denormalized Dual Value Storage)

```ts
// ❌ Bad: Same scalar duplicated across two maps
Student.courseGrades: Map<Course, number>  ↔  Course.studentGrades: Map<Student, number>
```

**Why**: Each numeric grade is stored twice (by student and by course). This is denormalized. Use a junction entity instead:

```ts
// ✅ Preferred normalization
StudentCourseEnrollment: { student: Student; course: Course; grade: number }
Student.enrollments: Set<StudentCourseEnrollment> ↔ StudentCourseEnrollment.student
Course.enrollments: Set<StudentCourseEnrollment> ↔ StudentCourseEnrollment.course
```

### 4. Simple Property as Inverse Target

Any attempt to set `inverseProp` on a property whose type is `string | number | boolean` should be rejected.

---

## Allowed Patterns (✅)

### A. Array Bidirectional Relationships (Ordered-Set Semantics)

```ts
Company.employees: EmployeeArray  ↔  Employee.company: Company
Project.assignedEmployees: EmployeeArray  ↔  Employee.projects: ProjectArray
```

**Runtime semantics**:

- Duplicate entity insertions via `push`, `unshift`, `splice(..., 0, el)` are filtered out.
- `setByIndex(i, sameEntity)` throws (or becomes a no-op depending on path) to prevent duplicates.
- Removal operations (`splice`, `pop`, `shift`) compact naturally and detach inverse links.

### B. Set Bidirectional Relationships (Many-to-Many)

```ts
Department.employees: Set<Employee>  ↔  Employee.departments: Set<Department>
```

**Behavior**:

- Standard Set uniqueness plus inverse synchronization.
- Adding an existing element is a no-op (fast path).
- Clearing updates all inverse references.

### C. Map Value-Based Entity Property Inverse (One-to-Many / Annotated Key)

```ts
Department.employeesByRole: Map<string, Employee>  ↔  Employee.department: Department
// Example usage:
engineering.employeesByRole.set("manager", alice)  // sets alice.department = engineering
engineering.employeesByRole.delete("manager")       // sets alice.department = undefined
```

**Constraints**:

- Key must be a simple type (`string` recommended) – NOT an entity.
- Value must be an entity that defines the inverse property.

### D. Map Value-Based Entity Collection Inverse (Many-to-Many with Key Label)

```ts
Team.membersBySkill: Map<string, Employee>  ↔  Employee.teams: Set<Team>
team.membersBySkill.set("frontend", bob)  // adds team to bob.teams
team.membersBySkill.delete("frontend")    // removes team from bob.teams
```

**Use Case**: Provides a keyed lookup (e.g. role/skill slot) while maintaining a normalized set membership.

### E. Junction Entity for Extra Data (Preferred over Dual Maps)

```ts
type StudentCourseEnrollment = {
  student: Student;      // ↔ Student.enrollments (Set<StudentCourseEnrollment>)
  course: Course;        // ↔ Course.enrollments (Set<StudentCourseEnrollment>)
  grade: number;         // scalar stays local (no inverse)
};
```

**Benefit**: Additional attributes (grade, role, metadata) live in one canonical place.

---

## Modeling Decision Matrix

| Goal | Recommended Structure | Avoid |
|------|-----------------------|-------|
| One-to-many (ordered, no duplicates) | Array + inverse (ordered-set semantics) | Plain array without inverse if you need cross-navigation |
| Many-to-many (no ordering) | Two Sets with mutual inverse | Parallel arrays storing IDs |
| Labeled single assignment (slot -> entity) | Map<string, Entity> ↔ entity.property | Map<Entity, Simple> with inverse |
| Labeled many-to-many | Map<string, Entity> ↔ entity.collection | Dual maps with mirrored simple values |
| Relationship + extra fields | Junction entity + Set(s) | Two value-storing maps mirroring each other |

---

## Runtime Behaviors & Edge Cases

### Arrays (inverse-managed)

- Duplicate insertion attempts are silently ignored for mutators (`push`, `unshift`, `splice` insertion, `concat` adds) – ensuring canonical membership.
- Direct index overwrite with an existing different position element is prevented (throws or no-ops depending on path) to avoid reordering via duplication tricks.
- Non-mutating operations like `concat` still perform inverse linking for *new* unique entities.
- `reverse`, `sort` preserve membership; inverses untouched (order change only).

### Sets

- Adding existing element: no-op (fast early return branch).
- Deleting absent element: no-op.
- `clear()` only performs inverse cleanup when non-empty.

### Maps (value-based inverse only)

- Setting the same value again for a key (idempotent) is a no-op branch.
- Deleting a key triggers inverse cleanup only if an entity was actually mapped.
- Clearing an empty map is a no-op; clearing a populated map walks values to detach inverses.

---

## Validation (Planned / In Progress)

To be enforced at import-time (namespace validation) and runtime (accessor setup):

1. Reject simple property inverses.
2. Reject Map key-based inverses.
3. Reject Map inverse patterns where the value type is simple.
4. Provide explicit, descriptive error messages to guide normalization.

### Example Error Messages

- `Simple properties (string, number, boolean) cannot have inverse relationships.`
- `Map KEY-based inverse relationships are not allowed. Only Map VALUE-based inverses are valid.`
- `Map inverse relationships require entity VALUE type. Simple value types cannot have inverses.`
- `Denormalized pattern 'Student.courseGrades ↔ Course.studentGrades' is not allowed; use a junction entity.`

---

## Example Summary (Valid vs Invalid)

| Pattern | Example | Status | Reason |
|---------|---------|--------|--------|
| Array ↔ Entity (1:M) | `Company.employees ↔ Employee.company` | ✅ | Entity collection normalized |
| Array ↔ Array (M:M) | `Project.assignedEmployees ↔ Employee.projects` | ✅ | Both sides collections of entities |
| Set ↔ Set (M:M) | `Department.employees ↔ Employee.departments` | ✅ | Pure many-to-many |
| Map<Simple, Entity> ↔ Entity.property | `Department.employeesByRole ↔ Employee.department` | ✅ | Value-based inverse |
| Map<Simple, Entity> ↔ Entity.collection | `Team.membersBySkill ↔ Employee.teams` | ✅ | Value-based collection join |
| Map<Entity, number> ↔ Entity.property | `Department.employeeGrades ↔ Employee.department` | ❌ | Key-based inverse / redundant |
| Map<Entity, number> ↔ Map<Entity, number> | `Student.courseGrades ↔ Course.studentGrades` | ❌ | Dual simple values (denormalized) |
| string ↔ string | `Employee.name ↔ Department.managerName` | ❌ | Simple property inverse |

---

## Migration Guidance

If you currently rely on a forbidden pattern (e.g. mirrored grade maps):

1. Introduce a junction entity to hold the scalar value.
2. Replace both maps with Sets pointing to the junction entity.
3. Update queries to traverse `student.enrollments` or `course.enrollments`.
4. Remove obsolete inverse declarations.

---

## Best Practices Checklist

- [ ] Always ask: does this inverse create duplicate scalar data? If yes → redesign.
- [ ] Use Sets for canonical membership without ordering; Arrays when ordering matters.
- [ ] Use Maps only to introduce a *key dimension* (role, label, slot) over entity values.
- [ ] Never model extra attributes by duplicating value-carrying Maps—use a junction entity.
- [ ] Keep error messages explicit to educate contributors.
- [ ] Add tests before introducing new inverse pattern variants.

---

## Future Enhancements (Roadmap)

1. Enforced validation layer (Phase 1) to block bad patterns early.
2. Documentation examples for junction entities (student enrollments, role assignments).
3. Performance notes for large collection inverses; potential batching.
4. Optional debug instrumentation toggle to inspect inverse update paths.

---

## Quick Reference (Decision Flow)

```text
Is the property simple (string/number/boolean)?
  → Yes: NO inverse.
  → No:
    Is it a Map?
      → Yes: Are values entities?
           → Yes: Value-based inverse allowed. Keys must be simple.
           → No: Reject inverse.
      → No (Array/Set): Are elements entities?
           → Yes: Inverse allowed (arrays -> ordered set semantics, sets -> standard uniqueness).
           → No: Usually avoid inverse (unless future complex validations allow).
```

---

## Questions / Review

When proposing a new inverse pattern, include:

- Relationship cardinality & rationale
- Data normalization justification
- Whether ordering or key labeling is required
- Why a junction entity is or isn’t appropriate

This prevents reintroducing forbidden patterns over time.

---

*Maintained alongside operational plan. Update this file whenever relationship validation rules evolve.*
