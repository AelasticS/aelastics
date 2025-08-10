# Eternal Store: Best Practices for Testing Store Updates and Collections

## Core Concepts

When you call `store.objects.update()`:
1. A new immutable state is created.
2. Updated objects receive new references.
3. The updated object is returned.
4. All previous references become stale—**always refresh them!**

---

## Correct Testing Pattern

**1. Initial Setup**
```js
let employee1 = store.objects.create("/company/Employee", { id: "emp-001", firstName: "John" });
let employee2 = store.objects.create("/company/Employee", { id: "emp-002", firstName: "Jane" });
let company = store.objects.create("/company/Company", { id: "comp-001", name: "TechCorp" });
```

**2. Test Initial State**
```js
expect(company.employees.length).toBe(0); // Use .length for proxy arrays
expect(employee1.company).toBeUndefined();
```

**3. Update and Capture New Reference**
```js
employee1 = store.objects.update(emp => { emp.company = company; }, employee1);
```

**4. Refresh All Related References**
```js
company = store.objects.findByUUID(store.objects.getUUID(company));
employee2 = store.objects.findByUUID(store.objects.getUUID(employee2));
```

**5. Test Using Fresh References**
```js
expect(employee1.company).toBe(company);
expect(company.employees.includes(employee1)).toBe(true); // Use .includes(), not .toContain()
expect(company.employees.length).toBe(1);
```

---

## Key Rules

1. **Always** use the return value from `store.objects.update()`.
2. **Always** refresh all related object references after any update.
3. **Never** test using old references after an update.
4. Use `.length` for array size checks, **not** `.toEqual([])`.
5. Use proxied collection methods (`includes`, `has`, etc.) for membership checks.

---

## Common Mistakes

- ❌ Using old references after an update.
- ❌ Using Jest's `.toContain()` for arrays or `[...set].toContain()` for sets (fails due to reference equality).
- ❌ Not refreshing references after updates.
- ❌ Forgetting null checks (`!` or optional chaining).

---

## Testing Collections

### Arrays

- **Membership:**  
  ```js
  expect(company.employees.includes(employee1)).toBe(true);
  ```
- **Length:**  
  ```js
  expect(company.employees.length).toBe(2);
  ```
- **Empty:**  
  ```js
  expect(company.employees.length).toBe(0);
  ```

### Sets

- **Membership:**  
  ```js
  expect(employee.skills.has("JavaScript")).toBe(true);
  ```
- **Size:**  
  ```js
  expect(employee.skills.size).toBe(3);
  ```

### Maps

- **Entries:**  
  ```js
  expect(employee.metadata.has("department")).toBe(true);
  expect(employee.metadata.get("department")).toBe("Engineering");
  expect(employee.metadata.size).toBe(2);
  ```

---

## Example Test

```js
test("should connect/disconnect Company ↔ Employee[]", () => {
  let company = store.objects.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
  let employee1 = store.objects.create("/company/Employee", { id: "emp-001", firstName: "John" });

  // Initial state
  expect(company.employees.length).toBe(0);
  expect(employee1.company).toBeUndefined();

  // Add employee to company
  employee1 = store.objects.update(emp => { emp.company = company; }, employee1);
  company = store.objects.findByUUID(store.objects.getUUID(company));

  expect(company.employees.includes(employee1)).toBe(true);
  expect(employee1.company).toBe(company);

  // Remove employee from company
  employee1 = store.objects.update(emp => { emp.company = undefined; }, employee1);
  company = store.objects.findByUUID(store.objects.getUUID(company));

  expect(company.employees.includes(employee1)).toBe(false);
  expect(company.employees.length).toBe(0);
  expect(employee1.company).toBeUndefined();
});
```

---

## Why This Pattern Works

- **UUID-based comparison:** Proxied collection methods compare by UUID, not reference.
- **Immutability:** Every update returns new object references.
- **Bidirectional consistency:** Both sides of relationships are always in sync.

---

## Summary

- **Always refresh references after updates.**
- **Use proxied collection methods for assertions.**
- **Never use stale references or Jest's `.toContain()` for collections.**
- **Check array size with `.length`.**

Follow these patterns for reliable, accurate tests with the eternal store.

---

## Type Validation Testing

The eternal store now includes comprehensive type validation that ensures type safety across all operations. When writing tests, you should verify both successful operations and expected validation failures.

### Type Validation Overview

Type validation occurs at multiple levels:
1. **Object Creation**: All initial properties are validated during `store.create()`
2. **Property Assignment**: Object properties are validated during `store.update()`
3. **Collection Operations**: Array, Set, and Map elements are validated during modifications

### Expected Error Messages

#### Primitive Type Validation
```js
// String validation
expect(() => {
  store.create("/company/Employee", { firstName: 123 });
}).toThrow(/Expected string, but received number/);

// Boolean validation  
expect(() => {
  store.create("/company/Employee", { isActive: "true" });
}).toThrow(/Expected boolean, but received string/);

// Number validation
expect(() => {
  store.create("/company/Company", { foundedYear: "2020" });
}).toThrow(/Expected number, but received string/);

// Invalid numbers (NaN, Infinity)
expect(() => {
  store.create("/company/Company", { foundedYear: NaN });
}).toThrow(/Expected number, but received number/);
```

#### Object Type Validation
```js
// Wrong object type assignment
expect(() => {
  store.update(emp => {
    emp.badge = company; // Company instead of Badge
  }, employee);
}).toThrow(/Type mismatch for property 'badge': Cannot assign object of type/);

// Non-store object assignment
expect(() => {
  store.create("/company/Employee", { 
    company: { id: "plain-object" } // Plain object, not store object
  });
}).toThrow(/Object assigned to property 'company' must have a UUID/);

// Primitive instead of object
expect(() => {
  store.update(emp => {
    emp.badge = "invalid-badge"; // String instead of Badge object
  }, employee);
}).toThrow(/Invalid value for property \"badge\". Expected an object, but received string/);
```

#### Collection Element Validation
```js
// Array element validation
expect(() => {
  store.update(company => {
    company.employees.push(badge); // Badge in Employee array
  }, company);
}).toThrow(/Type mismatch for property 'employees\[element\]'/);

// Set element validation
expect(() => {
  store.update(employee => {
    employee.skills.add(123); // Number in string set
  }, employee);
}).toThrow(/Expected string, but received number/);

// Map value validation
expect(() => {
  store.update(employee => {
    employee.metadata.set("department", company); // Object in string map
  }, employee);
}).toThrow(/Expected string, but received object/);

// Null/undefined in collections
expect(() => {
  store.update(employee => {
    employee.skills.add(null);
  }, employee);
}).toThrow(/Cannot add null or undefined to collection property 'skills'/);
```

#### Object Creation Validation
```js
// Invalid initial collection elements
expect(() => {
  store.create("/company/Employee", {
    skills: ["JavaScript", 123, "React"] // Mixed types in array
  });
}).toThrow(/Expected string, but received number/);

// Non-existent properties
expect(() => {
  store.create("/company/Employee", {
    invalidProperty: "value"
  });
}).toThrow(/Property 'invalidProperty' does not exist in type '\/company\/Employee'/);
```

### Testing Type Validation Patterns

#### 1. Test Valid Operations First
```js
test("should allow valid type assignments", () => {
  // Test successful operations first
  expect(() => {
    const employee = store.create("/company/Employee", {
      firstName: "John",
      isActive: true,
      company: validCompany
    });
  }).not.toThrow();
});
```

#### 2. Test Each Validation Rule
```js
test("should validate primitive types during creation", () => {
  // Test each primitive type separately
  expect(() => {
    store.create("/company/Employee", { firstName: 123 });
  }).toThrow(/Expected string, but received number/);
  
  expect(() => {
    store.create("/company/Employee", { isActive: "true" });
  }).toThrow(/Expected boolean, but received string/);
});
```

#### 3. Test Collection Type Validation
```js
test("should validate collection element types", () => {
  const employee = store.create("/company/Employee", { /* valid props */ });
  
  // Valid addition should work
  expect(() => {
    store.update(emp => {
      emp.skills.add("JavaScript");
    }, employee);
  }).not.toThrow();
  
  // Invalid type should fail
  expect(() => {
    store.update(emp => {
      emp.skills.add(123);
    }, employee);
  }).toThrow(/Expected string, but received number/);
});
```

#### 4. Test Complex Validation Scenarios
```js
test("should handle complex validation scenarios", () => {
  // Test inheritance and subtype assignments
  const superAdmin = store.create("/subtypes/SuperAdminUser", {
    systemAccess: true,
    securityClearance: "TOP_SECRET"
  });
  
  // Test edge cases
  expect(() => {
    store.create("/company/Company", {
      foundedYear: Infinity
    });
  }).toThrow(/Expected number, but received number/);
});
```

### Validation Testing Best Practices

1. **Test Both Success and Failure Cases**: Always verify that valid operations work and invalid operations fail with appropriate errors.

2. **Use Specific Error Message Patterns**: Match against specific error message patterns to ensure the right validation is triggered.

3. **Test at Multiple Levels**: Validate during object creation, property updates, and collection operations.

4. **Cover Edge Cases**: Test null, undefined, empty collections, special numbers (NaN, Infinity), and boundary conditions.

5. **Test Error Message Quality**: Ensure error messages are clear and include property names and type information.

#### Example Comprehensive Validation Test
```js
test("comprehensive type validation", () => {
  const company = store.create("/company/Company", {
    id: "comp-001",
    name: "Tech Corp"
  });

  // Valid object creation
  expect(() => {
    const employee = store.create("/company/Employee", {
      id: "emp-001",
      firstName: "John",
      lastName: "Doe",
      email: "john@company.com",
      isActive: true,
      company: company
    });
    
    // Valid collection operations
    store.update(emp => {
      emp.skills.add("JavaScript");
      emp.skills.add("TypeScript");
    }, employee);
    
    expect(employee.skills.size).toBe(2);
  }).not.toThrow();

  // Invalid type assignments
  expect(() => {
    store.create("/company/Employee", {
      firstName: 123, // Invalid: number instead of string
      company: company
    });
  }).toThrow(/Expected string, but received number/);

  // Invalid collection elements
  const employee = store.create("/company/Employee", {
    id: "emp-002",
    firstName: "Jane",
    company: company
  });
  
  expect(() => {
    store.update(emp => {
      emp.skills.add(123); // Invalid: number in string set
    }, employee);
  }).toThrow(/Expected string, but received number/);
});
```

This comprehensive validation system ensures type safety while maintaining the flexibility and power of the eternal store's relationship management.