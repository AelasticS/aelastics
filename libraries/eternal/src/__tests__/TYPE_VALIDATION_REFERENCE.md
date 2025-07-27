# Type Validation Testing Reference

## Overview

This document provides a comprehensive reference for testing type validation features in the eternal store. Type validation ensures runtime type safety across object creation, property assignment, and collection operations.

## Validation Levels

### 1. Object Creation Validation
Type validation during `store.create()` ensures all initial properties match their declared types.

### 2. Property Assignment Validation  
Type validation during `store.update()` ensures object properties maintain type consistency.

### 3. Collection Operation Validation
Type validation during array, set, and map operations ensures collection elements match the expected types.

## Error Message Patterns

### Primitive Type Errors

| Scenario | Error Pattern | Example |
|----------|---------------|---------|
| String expected | `/Expected string, but received {type}/` | `Expected string, but received number` |
| Number expected | `/Expected number, but received {type}/` | `Expected number, but received string` |
| Boolean expected | `/Expected boolean, but received {type}/` | `Expected boolean, but received string` |
| Invalid number | `/Expected number, but received number/` | For NaN, Infinity values |

### Object Type Errors

| Scenario | Error Pattern | Example |
|----------|---------------|---------|
| Wrong object type | `/Type mismatch for property '{prop}': Cannot assign object of type/` | `Type mismatch for property 'badge': Cannot assign object of type` |
| Non-store object | `/Object assigned to property '{prop}' must have a UUID/` | `Object assigned to property 'company' must have a UUID` |
| Primitive for object | `/Invalid value for property "{prop}". Expected an object, but received {type}/` | `Invalid value for property "badge". Expected an object, but received string` |

### Collection Type Errors

| Scenario | Error Pattern | Example |
|----------|---------------|---------|
| Array element type | `/Type mismatch for property '{prop}\[element\]'/` | `Type mismatch for property 'employees[element]'` |
| Set element type | `/Expected {type}, but received {actual}/` | `Expected string, but received number` |
| Map value type | `/Expected {type}, but received {actual}/` | `Expected string, but received object` |
| Null in collection | `/Cannot {operation} null or undefined to collection property '{prop}'/` | `Cannot add null or undefined to collection property 'skills'` |

### Creation Errors

| Scenario | Error Pattern | Example |
|----------|---------------|---------|
| Non-existent property | `/Property '{prop}' does not exist in type '{type}'/` | `Property 'invalidProp' does not exist in type '/company/Employee'` |
| Invalid element during creation | `/Expected {type}, but received {actual}/` | For mixed-type arrays in initial state |

## Test Patterns by Validation Type

### Primitive Type Validation Tests

```javascript
describe("Primitive type validation", () => {
    test("should validate string properties", () => {
        expect(() => {
            store.create("/company/Employee", { firstName: "John" });
        }).not.toThrow();
        
        expect(() => {
            store.create("/company/Employee", { firstName: 123 });
        }).toThrow(/Expected string, but received number/);
    });
    
    test("should validate number properties", () => {
        expect(() => {
            store.create("/company/Company", { foundedYear: 2020 });
        }).not.toThrow();
        
        expect(() => {
            store.create("/company/Company", { foundedYear: "2020" });
        }).toThrow(/Expected number, but received string/);
    });
    
    test("should validate boolean properties", () => {
        expect(() => {
            store.create("/company/Employee", { isActive: true });
        }).not.toThrow();
        
        expect(() => {
            store.create("/company/Employee", { isActive: "true" });
        }).toThrow(/Expected boolean, but received string/);
    });
    
    test("should reject invalid number values", () => {
        expect(() => {
            store.create("/company/Company", { foundedYear: NaN });
        }).toThrow(/Expected number, but received number/);
        
        expect(() => {
            store.create("/company/Company", { foundedYear: Infinity });
        }).toThrow(/Expected number, but received number/);
    });
});
```

### Object Type Validation Tests

```javascript
describe("Object type validation", () => {
    let company, badge, employee;
    
    beforeEach(() => {
        company = store.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
        badge = store.create("/company/Badge", { id: "badge-001", badgeNumber: "B001", isActive: true });
    });
    
    test("should allow correct object type assignment", () => {
        expect(() => {
            employee = store.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                company: company,
                badge: badge
            });
        }).not.toThrow();
        
        expect(employee.company).toBe(company);
        expect(employee.badge).toBe(badge);
    });
    
    test("should reject wrong object type assignment", () => {
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                badge: company // Wrong type: Company instead of Badge
            });
        }).toThrow(/Type mismatch for property 'badge': Cannot assign object of type/);
    });
    
    test("should reject non-store objects", () => {
        const plainObject = { id: "plain", name: "Plain Object" };
        
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                company: plainObject
            });
        }).toThrow(/Object assigned to property 'company' must have a UUID/);
    });
    
    test("should reject primitive values for object properties", () => {
        expect(() => {
            employee = store.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                company: company
            });
            
            store.update(emp => {
                emp.badge = "invalid-badge"; // String instead of Badge
            }, employee);
        }).toThrow(/Invalid value for property "badge". Expected an object, but received string/);
    });
});
```

### Collection Type Validation Tests

```javascript
describe("Collection type validation", () => {
    let company, employee, badge;
    
    beforeEach(() => {
        company = store.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
        employee = store.create("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            company: company
        });
        badge = store.create("/company/Badge", { id: "badge-001", badgeNumber: "B001", isActive: true });
    });
    
    describe("Array validation", () => {
        test("should allow correct element types", () => {
            const employee2 = store.create("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                company: company
            });
            
            expect(() => {
                store.update(comp => {
                    comp.employees.push(employee, employee2);
                }, company);
            }).not.toThrow();
            
            expect(company.employees.includes(employee)).toBe(true);
            expect(company.employees.includes(employee2)).toBe(true);
        });
        
        test("should reject wrong element types", () => {
            expect(() => {
                store.update(comp => {
                    comp.employees.push(badge); // Badge in Employee array
                }, company);
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });
        
        test("should validate during creation with initial elements", () => {
            expect(() => {
                store.create("/company/Company", {
                    id: "comp-002",
                    name: "Bad Corp",
                    employees: [employee, badge] // Mixed types
                });
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });
    });
    
    describe("Set validation", () => {
        test("should allow correct element types", () => {
            expect(() => {
                store.update(emp => {
                    emp.skills.add("JavaScript");
                    emp.skills.add("TypeScript");
                }, employee);
            }).not.toThrow();
            
            expect(employee.skills.has("JavaScript")).toBe(true);
            expect(employee.skills.size).toBe(2);
        });
        
        test("should reject wrong element types", () => {
            expect(() => {
                store.update(emp => {
                    emp.skills.add(123); // Number in string set
                }, employee);
            }).toThrow(/Expected string, but received number/);
        });
        
        test("should reject null/undefined elements", () => {
            expect(() => {
                store.update(emp => {
                    emp.skills.add(null);
                }, employee);
            }).toThrow(/Cannot add null or undefined to collection property 'skills'/);
        });
    });
    
    describe("Map validation", () => {
        test("should allow correct value types", () => {
            expect(() => {
                store.update(emp => {
                    emp.metadata.set("department", "Engineering");
                    emp.metadata.set("level", "Senior");
                }, employee);
            }).not.toThrow();
            
            expect(employee.metadata.get("department")).toBe("Engineering");
            expect(employee.metadata.size).toBe(2);
        });
        
        test("should reject wrong value types", () => {
            expect(() => {
                store.update(emp => {
                    emp.metadata.set("department", company); // Object in string map
                }, employee);
            }).toThrow(/Expected string, but received object/);
        });
    });
});
```

### Object Creation Validation Tests

```javascript
describe("Object creation validation", () => {
    test("should validate all properties during creation", () => {
        const company = store.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
        
        // Valid creation
        expect(() => {
            const employee = store.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true,
                company: company
            });
        }).not.toThrow();
        
        // Invalid primitive type
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-002",
                firstName: 123, // Number instead of string
                company: company
            });
        }).toThrow(/Expected string, but received number/);
    });
    
    test("should validate collection elements during creation", () => {
        const company = store.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
        
        // Valid collection elements
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                company: company,
                skills: ["JavaScript", "TypeScript"] // Valid string array
            });
        }).not.toThrow();
        
        // Invalid collection elements
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                company: company,
                skills: ["JavaScript", 123, "React"] // Mixed types
            });
        }).toThrow(/Expected string, but received number/);
    });
    
    test("should reject non-existent properties", () => {
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                invalidProperty: "value" // Property doesn't exist
            });
        }).toThrow(/Property 'invalidProperty' does not exist in type '\/company\/Employee'/);
    });
});
```

## Edge Case Testing

### Boundary Value Testing

```javascript
describe("Boundary value validation", () => {
    test("should handle edge case numbers", () => {
        // Valid extreme values
        expect(() => {
            store.create("/company/Company", {
                id: "comp-001",
                name: "Corp",
                foundedYear: Number.MAX_SAFE_INTEGER
            });
        }).not.toThrow();
        
        expect(() => {
            store.create("/company/Company", {
                id: "comp-002",
                name: "Corp",
                foundedYear: Number.MIN_SAFE_INTEGER
            });
        }).not.toThrow();
        
        // Invalid special numbers
        expect(() => {
            store.create("/company/Company", {
                id: "comp-003",
                name: "Corp",
                foundedYear: Infinity
            });
        }).toThrow(/Expected number, but received number/);
    });
    
    test("should handle empty and null values", () => {
        const company = store.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
        
        // Empty string should be valid
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-001",
                firstName: "", // Empty string
                company: company
            });
        }).not.toThrow();
        
        // Empty collections should be valid
        expect(() => {
            store.create("/company/Employee", {
                id: "emp-002",
                firstName: "John",
                company: company,
                skills: [] // Empty array
            });
        }).not.toThrow();
    });
});
```

### Inheritance Testing

```javascript
describe("Inheritance validation", () => {
    test("should validate inheritance relationships", () => {
        // Create base type
        const baseUser = store.create("/subtypes/BaseUser", {
            id: "user-001",
            username: "johndoe",
            email: "john@example.com",
            isActive: true,
            createdAt: new Date()
        });
        
        // Create inherited type
        expect(() => {
            const superAdmin = store.create("/subtypes/SuperAdminUser", {
                systemAccess: true,
                securityClearance: "TOP_SECRET"
            });
        }).not.toThrow();
        
        // Test inheritance validation in collections would require
        // proper namespace setup with inheritance-aware collections
    });
});
```

## Performance Testing

### Stress Testing Validation

```javascript
describe("Validation performance", () => {
    test("should handle bulk validation efficiently", () => {
        const company = store.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
        const startTime = Date.now();
        
        // Create many objects with validation
        for (let i = 0; i < 100; i++) {
            expect(() => {
                store.create("/company/Employee", {
                    id: `emp-${i.toString().padStart(3, '0')}`,
                    firstName: `Employee${i}`,
                    lastName: "Test",
                    email: `emp${i}@company.com`,
                    isActive: true,
                    company: company
                });
            }).not.toThrow();
        }
        
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
    
    test("should handle large collection validation efficiently", () => {
        const company = store.create("/company/Company", { id: "comp-001", name: "Tech Corp" });
        const employee = store.create("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            company: company
        });
        
        const startTime = Date.now();
        
        // Add many elements to collection
        store.update(emp => {
            for (let i = 0; i < 50; i++) {
                emp.skills.add(`Skill${i}`);
            }
        }, employee);
        
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
        expect(employee.skills.size).toBe(50);
    });
});
```

## Testing Best Practices

1. **Test Both Success and Failure**: Always verify valid operations work and invalid operations fail appropriately.

2. **Use Specific Error Patterns**: Match against exact error message patterns to ensure correct validation triggers.

3. **Test at All Levels**: Cover object creation, property updates, and collection operations.

4. **Cover Edge Cases**: Test boundary values, special numbers, null/undefined, and inheritance scenarios.

5. **Verify Error Quality**: Ensure error messages are helpful and include relevant context.

6. **Performance Awareness**: Include stress tests to ensure validation doesn't significantly impact performance.

7. **Comprehensive Coverage**: Test all primitive types, object relationships, and collection types in your schema.

## Quick Reference

### Most Common Test Patterns

```javascript
// Positive test
expect(() => { 
    /* valid operation */ 
}).not.toThrow();

// Negative test with specific error
expect(() => { 
    /* invalid operation */ 
}).toThrow(/Expected error pattern/);

// Collection membership check
expect(collection.includes(item)).toBe(true);
expect(collection.size).toBe(expectedSize);

// Object relationship check
expect(obj.property).toBe(expectedObject);
expect(obj.property).toBeUndefined(); // for optional properties
```

This reference provides comprehensive guidance for testing all aspects of the eternal store's type validation system.