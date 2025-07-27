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

Follow these patterns for reliable, accurate tests with the