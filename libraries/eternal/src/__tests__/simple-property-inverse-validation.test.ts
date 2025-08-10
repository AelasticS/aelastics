import { RegistryService, NamespaceImportError } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { coreNamespace } from "./example-namespaces/core-namespace";

describe('Simple Property Inverse Validation', () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        registry.importNamespace(coreNamespace);
    });

    describe('Invalid inverse relationships should be rejected', () => {
        it('should reject simple string property with inverse relationship', () => {
            const invalidNamespace = {
                qName: '/invalid',
                types: new Map([
                    ['Employee', {
                        qName: '/invalid/Employee',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['name', {
                                name: 'name',
                                typeRef: 'string',
                                optional: false,
                                inverseTypeRef: '/invalid/Department',
                                inverseProp: 'managerName'
                            }]
                        ])
                    }],
                    ['Department', {
                        qName: '/invalid/Department',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['managerName', {
                                name: 'managerName',
                                typeRef: 'string',
                                optional: false,
                                inverseTypeRef: '/invalid/Employee',
                                inverseProp: 'name'
                            }]
                        ])
                    }]
                ]),
                exports: ['Employee', 'Department'],
                imports: new Map()
            };

            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors.some((err: string) => 
                    err.includes("Simple property 'name' of type 'string' cannot have inverse relationship")
                )).toBe(true);
            }
        });

        it('should reject simple number property with inverse relationship', () => {
            const invalidNamespace = {
                qName: '/invalid',
                types: new Map([
                    ['Product', {
                        qName: '/invalid/Product',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['price', {
                                name: 'price',
                                typeRef: 'number',
                                optional: false,
                                inverseTypeRef: '/invalid/Order',
                                inverseProp: 'totalAmount'
                            }]
                        ])
                    }],
                    ['Order', {
                        qName: '/invalid/Order',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['totalAmount', {
                                name: 'totalAmount',
                                typeRef: 'number',
                                optional: false,
                                inverseTypeRef: '/invalid/Product',
                                inverseProp: 'price'
                            }]
                        ])
                    }]
                ]),
                exports: ['Product', 'Order'],
                imports: new Map()
            };

            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors.some((err: string) => 
                    err.includes("Simple property 'price' of type 'number' cannot have inverse relationship")
                )).toBe(true);
            }
        });

        it('should reject simple boolean property with inverse relationship', () => {
            const invalidNamespace = {
                qName: '/invalid',
                types: new Map([
                    ['User', {
                        qName: '/invalid/User',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['isActive', {
                                name: 'isActive',
                                typeRef: 'boolean',
                                optional: false,
                                inverseTypeRef: '/invalid/Status',
                                inverseProp: 'enabled'
                            }]
                        ])
                    }],
                    ['Status', {
                        qName: '/invalid/Status',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['enabled', {
                                name: 'enabled',
                                typeRef: 'boolean',
                                optional: false,
                                inverseTypeRef: '/invalid/User',
                                inverseProp: 'isActive'
                            }]
                        ])
                    }]
                ]),
                exports: ['User', 'Status'],
                imports: new Map()
            };

            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors.some((err: string) => 
                    err.includes("Simple property 'isActive' of type 'boolean' cannot have inverse relationship")
                )).toBe(true);
            }
        });
    });

    describe('Valid inverse relationships should be accepted', () => {
        it('should accept entity property with inverse relationship', () => {
            const validNamespace = {
                qName: '/valid',
                types: new Map([
                    ['Employee', {
                        qName: '/valid/Employee',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['department', {
                                name: 'department',
                                typeRef: '/valid/Department',
                                optional: false,
                                inverseTypeRef: '/valid/Department',
                                inverseProp: 'manager'
                            }]
                        ])
                    }],
                    ['Department', {
                        qName: '/valid/Department',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['manager', {
                                name: 'manager',
                                typeRef: '/valid/Employee',
                                optional: false,
                                inverseTypeRef: '/valid/Employee',
                                inverseProp: 'department'
                            }]
                        ])
                    }]
                ]),
                exports: ['Employee', 'Department'],
                imports: new Map()
            };

            expect(() => {
                registry.importNamespace(validNamespace);
            }).not.toThrow();
        });

        it('should accept Map collection with entity values and inverse relationship', () => {
            const validNamespace = {
                qName: '/valid',
                types: new Map([
                    ['Department', {
                        qName: '/valid/Department',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['employeesByRole', {
                                name: 'employeesByRole',
                                typeRef: '/valid/EmployeeMap',
                                optional: false,
                                inverseTypeRef: '/valid/Employee',
                                inverseProp: 'department'
                            }]
                        ])
                    }],
                    ['Employee', {
                        qName: '/valid/Employee',
                        kind: 'entity' as const,
                        properties: new Map([
                            ['department', {
                                name: 'department',
                                typeRef: '/valid/Department',
                                optional: false,
                                inverseTypeRef: '/valid/Department',
                                inverseProp: 'employeesByRole'
                            }]
                        ])
                    }],
                    ['EmployeeMap', {
                        qName: '/valid/EmployeeMap',
                        kind: 'map' as const,
                        keyType: 'string',
                        valueType: '/valid/Employee'
                    }]
                ]),
                exports: ['Department', 'Employee', 'EmployeeMap'],
                imports: new Map()
            };

            expect(() => {
                registry.importNamespace(validNamespace);
            }).not.toThrow();
        });
    });
});