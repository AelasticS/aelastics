### Pattern for Testing After Store Update Operations

  Core Concept:

  When store.objects.update() is called, it:
  1. Creates a new state in the store
  2. Creates new versions of all updated objects
  3. Returns the new reference to the updated object
  4. Old variable references still point to old versions from previous state

  Correct Testing Pattern:

  // 1. Initial setup - get references to objects
  let employee1 = store.objects.create("/company/Employee", { id: "emp-001",
  firstName: "John" });
  let employee2 = store.objects.create("/company/Employee", { id: "emp-002",
  firstName: "Jane" });
  let company = store.objects.create("/company/Company", { id: "comp-001",
  name: "TechCorp" });

  // 2. Test initial state - use .length for proxy arrays
  expect(company.employees.length).toBe(0); // ✅ Correct for proxy arrays
  expect(employee1.company).toBeUndefined();

  // 3. Perform update operation - CAPTURE the returned new reference
  employee1 = store.objects.update((emp) => {
      emp.company = company;
  }, employee1);

  // 4. Get fresh references to OTHER objects from new state using UUID
  company = store.findByUUID(company[uuid]); // Get company from new state
  employee2 = store.findByUUID(employee2[uuid]); // Get employee2 from new 
  state

  // 5. Now test using fresh references from current state
  expect(employee1.company).toBe(company); // ✅ Correct - using new 
  references
  expect(company.employees).toContain(employee1); // ✅ Correct - testing 
  current state
  expect(company.employees.length).toBe(1); // ✅ Correct for proxy arrays

  Common Mistake (What causes test failures):

  // ❌ WRONG - using old references after update
  employee1 = store.objects.update((emp) => {
      emp.company = company;
  }, employee1);

  // company variable still points to OLD version from previous state!
  expect(company.employees).toContain(employee1); // ❌ FAILS - testing old 
  state
  expect(company.employees.length).toBe(1); // ❌ FAILS - testing old state

  Key Rules:

  1. Always capture the return value from store.objects.update()
  2. Always refresh references to other objects using store.findByUUID(uuid)
  3. Test using fresh references from the current state
  4. Never test using old variable references after an update
  5. Use .length property for testing proxy array sizes, not .toEqual([])

  Example Fix for Relationship Test:

  // Test initial state
  expect(company.employees.length).toBe(0); // ✅ Use .length for proxy arrays
  expect(employee1.company).toBeUndefined();

  // Perform update and get new reference
  employee1 = store.objects.update((emp) => {
      emp.company = company;
  }, employee1);

  // Refresh reference to company from new state
  company = store.findByUUID(company[uuid]);

  // Now test with fresh references
  expect(employee1.company).toBe(company); // ✅ Works
  expect(company.employees).toContain(employee1); // ✅ Works
  expect(company.employees.length).toBe(1); // ✅ Works with proxy arrays

  This pattern must be followed in every test case that uses the update method
   to ensure we're testing the current state, not stale object references.