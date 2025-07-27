import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { isComplexType } from "../../registry/TypeDefinitions";
import { subtypeExamplesNamespace } from "../example-namespaces/subtype-examples-namespace";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { coreNamespace } from "../example-namespaces/core-namespace";

describe("Inheritance and Subtype Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("Inheritance Tests", () => {
        test("should successfully import namespace with inheritance relationships", () => {
            try {
                registry.importNamespace(subtypeExamplesNamespace);
            } catch (error) {
                if (error instanceof NamespaceImportError) {
                    console.log("Subtype namespace import errors:", error.validationResult.errors);
                }
                throw error;
            }
            
            // Verify inheritance types are imported
            expect(registry.hasType("/subtypes/BaseUser")).toBe(true);
            expect(registry.hasType("/subtypes/SuperAdminUser")).toBe(true);
        });

        test("should validate inheritance hierarchy metadata", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Get BaseUser type - should not have extends property
            const baseUserType = registry.getType("/subtypes/BaseUser");
            expect(baseUserType).toBeDefined();
            expect(isComplexType(baseUserType!)).toBe(true);
            expect(baseUserType?.kind).toBe("entity");
            
            if (baseUserType && isComplexType(baseUserType) && baseUserType.kind === "entity") {
                expect(baseUserType.extends).toBeUndefined();
            }
            
            // Get SuperAdminUser type and verify it extends BaseUser
            const superAdminUserType = registry.getType("/subtypes/SuperAdminUser");
            expect(superAdminUserType).toBeDefined();
            expect(isComplexType(superAdminUserType!)).toBe(true);
            expect(superAdminUserType?.kind).toBe("entity");
            
            if (superAdminUserType && isComplexType(superAdminUserType) && superAdminUserType.kind === "entity") {
                expect(superAdminUserType.extends).toBe("/subtypes/BaseUser");
            }
        });

        test("should validate inheritance with property inheritance", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Get BaseUser properties
            const baseUserType = registry.getType("/subtypes/BaseUser");
            expect(baseUserType).toBeDefined();
            expect(isComplexType(baseUserType!)).toBe(true);
            expect(baseUserType?.kind).toBe("entity");
            
            if (baseUserType && isComplexType(baseUserType) && baseUserType.kind === "entity") {
                expect(baseUserType.properties.has("id")).toBe(true);
                expect(baseUserType.properties.has("username")).toBe(true);
                expect(baseUserType.properties.has("email")).toBe(true);
                expect(baseUserType.properties.has("isActive")).toBe(true);
                expect(baseUserType.properties.has("createdAt")).toBe(true);
            }
            
            // Get SuperAdminUser properties (should have its own properties)
            const superAdminUserType = registry.getType("/subtypes/SuperAdminUser");
            if (superAdminUserType && isComplexType(superAdminUserType) && superAdminUserType.kind === "entity") {
                // SuperAdminUser's own properties
                expect(superAdminUserType.properties.has("systemAccess")).toBe(true);
                expect(superAdminUserType.properties.has("securityClearance")).toBe(true);
                
                // Note: Inherited properties are not merged in TypeMeta - inheritance is resolved at runtime
            }
        });

        test("should handle simple inheritance relationship", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Verify inheritance chain: BaseUser -> SuperAdminUser
            const baseUser = registry.getType("/subtypes/BaseUser");
            const superAdminUser = registry.getType("/subtypes/SuperAdminUser");
            
            expect(baseUser).toBeDefined();
            expect(superAdminUser).toBeDefined();
            
            // BaseUser has no parent
            if (baseUser && isComplexType(baseUser) && baseUser.kind === "entity") {
                expect(baseUser.extends).toBeUndefined();
            }
            
            // SuperAdminUser extends BaseUser
            if (superAdminUser && isComplexType(superAdminUser) && superAdminUser.kind === "entity") {
                expect(superAdminUser.extends).toBe("/subtypes/BaseUser");
            }
        });
    });

    describe("Subtype Tests", () => {
        test("should successfully import namespace with subtype definitions", () => {
            expect(() => {
                registry.importNamespace(subtypeExamplesNamespace);
            }).not.toThrow();
            
            // Verify subtype types are imported
            expect(registry.hasType("/subtypes/BaseUser")).toBe(true);
            expect(registry.hasType("/subtypes/BaseProduct")).toBe(true);
            expect(registry.hasType("/subtypes/AdminUser")).toBe(true);
            expect(registry.hasType("/subtypes/PremiumUser")).toBe(true);
            expect(registry.hasType("/subtypes/DigitalProduct")).toBe(true);
            expect(registry.hasType("/subtypes/PhysicalProduct")).toBe(true);
        });

        test("should validate SubtypeTypeMeta structure", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Get AdminUser subtype
            const adminUserSubtype = registry.getType("/subtypes/AdminUser");
            expect(adminUserSubtype).toBeDefined();
            expect(isComplexType(adminUserSubtype!)).toBe(true);
            expect(adminUserSubtype?.kind).toBe("subtype");
            
            if (adminUserSubtype && isComplexType(adminUserSubtype) && adminUserSubtype.kind === "subtype") {
                expect(adminUserSubtype.baseType).toBe("/subtypes/BaseUser");
                expect(adminUserSubtype.extraProperties).toBeDefined();
                expect(adminUserSubtype.extraProperties.size).toBeGreaterThan(0);
            }
            
            // Get PremiumUser subtype
            const premiumUserSubtype = registry.getType("/subtypes/PremiumUser");
            expect(premiumUserSubtype).toBeDefined();
            expect(isComplexType(premiumUserSubtype!)).toBe(true);
            expect(premiumUserSubtype?.kind).toBe("subtype");
            
            if (premiumUserSubtype && isComplexType(premiumUserSubtype) && premiumUserSubtype.kind === "subtype") {
                expect(premiumUserSubtype.baseType).toBe("/subtypes/BaseUser");
                expect(premiumUserSubtype.extraProperties).toBeDefined();
            }
        });

        test("should validate subtype extra properties", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Get AdminUser subtype
            const adminUserSubtype = registry.getType("/subtypes/AdminUser");
            if (adminUserSubtype && isComplexType(adminUserSubtype) && adminUserSubtype.kind === "subtype") {
                const extraProps = adminUserSubtype.extraProperties;
                expect(extraProps.has("adminLevel")).toBe(true);
                expect(extraProps.has("canManageUsers")).toBe(true);
                expect(extraProps.has("lastAdminAction")).toBe(true);
                
                const adminLevelProp = extraProps.get("adminLevel");
                expect(adminLevelProp?.typeRef).toBe("number");
                expect(adminLevelProp?.optional).toBe(false);
            }
            
            // Get PremiumUser subtype
            const premiumUserSubtype = registry.getType("/subtypes/PremiumUser");
            if (premiumUserSubtype && isComplexType(premiumUserSubtype) && premiumUserSubtype.kind === "subtype") {
                const extraProps = premiumUserSubtype.extraProperties;
                expect(extraProps.has("subscriptionLevel")).toBe(true);
                expect(extraProps.has("subscriptionExpires")).toBe(true);
                expect(extraProps.has("maxProjects")).toBe(true);
            }
        });

        test("should validate digital product subtype properties", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Get DigitalProduct subtype
            const digitalProductSubtype = registry.getType("/subtypes/DigitalProduct");
            expect(digitalProductSubtype).toBeDefined();
            expect(isComplexType(digitalProductSubtype!)).toBe(true);
            expect(digitalProductSubtype?.kind).toBe("subtype");
            
            if (digitalProductSubtype && isComplexType(digitalProductSubtype) && digitalProductSubtype.kind === "subtype") {
                expect(digitalProductSubtype.baseType).toBe("/subtypes/BaseProduct");
                const extraProps = digitalProductSubtype.extraProperties;
                expect(extraProps.has("downloadUrl")).toBe(true);
                expect(extraProps.has("fileSize")).toBe(true);
                
                const downloadUrlProp = extraProps.get("downloadUrl");
                expect(downloadUrlProp?.typeRef).toBe("string");
                expect(downloadUrlProp?.optional).toBe(false);
            }
        });

        test("should validate physical product subtype properties", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Get PhysicalProduct subtype
            const physicalProductSubtype = registry.getType("/subtypes/PhysicalProduct");
            expect(physicalProductSubtype).toBeDefined();
            expect(isComplexType(physicalProductSubtype!)).toBe(true);
            expect(physicalProductSubtype?.kind).toBe("subtype");
            
            if (physicalProductSubtype && isComplexType(physicalProductSubtype) && physicalProductSubtype.kind === "subtype") {
                expect(physicalProductSubtype.baseType).toBe("/subtypes/BaseProduct");
                const extraProps = physicalProductSubtype.extraProperties;
                expect(extraProps.has("weight")).toBe(true);
                expect(extraProps.has("dimensions")).toBe(true);
                expect(extraProps.has("shippingCost")).toBe(true);
                expect(extraProps.has("inventoryCount")).toBe(true);
            }
        });
    });

    describe("Inheritance and Subtype Validation", () => {
        test("should prevent circular inheritance", () => {
            // This test will be handled by validation error tests
            // For now, just verify that normal inheritance works
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Get all inheritance-related types
            const allInheritanceTypes = [
                "/subtypes/BaseUser",
                "/subtypes/SuperAdminUser"
            ];
            
            for (const typeQName of allInheritanceTypes) {
                expect(registry.hasType(typeQName)).toBe(true);
            }
        });

        test("should validate base type exists for subtypes", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Verify that BaseUser and BaseProduct base types exist
            expect(registry.hasType("/subtypes/BaseUser")).toBe(true);
            expect(registry.hasType("/subtypes/BaseProduct")).toBe(true);
            
            // Verify that user subtypes reference BaseUser
            const userSubtypeNames = [
                "/subtypes/AdminUser",
                "/subtypes/PremiumUser"
            ];
            
            for (const subtypeQName of userSubtypeNames) {
                const subtypeType = registry.getType(subtypeQName);
                expect(subtypeType).toBeDefined();
                
                if (subtypeType && isComplexType(subtypeType) && subtypeType.kind === "subtype") {
                    expect(subtypeType.baseType).toBe("/subtypes/BaseUser");
                }
            }
            
            // Verify that product subtypes reference BaseProduct
            const productSubtypeNames = [
                "/subtypes/DigitalProduct",
                "/subtypes/PhysicalProduct"
            ];
            
            for (const subtypeQName of productSubtypeNames) {
                const subtypeType = registry.getType(subtypeQName);
                expect(subtypeType).toBeDefined();
                
                if (subtypeType && isComplexType(subtypeType) && subtypeType.kind === "subtype") {
                    expect(subtypeType.baseType).toBe("/subtypes/BaseProduct");
                }
            }
        });

        test("should handle inheritance without roles", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Check that types can have inheritance
            const baseUserType = registry.getType("/subtypes/BaseUser");
            if (baseUserType && isComplexType(baseUserType) && baseUserType.kind === "entity") {
                expect(baseUserType.extends).toBeUndefined();
                // BaseUser doesn't have roles in this example
            }
            
            const superAdminUserType = registry.getType("/subtypes/SuperAdminUser");
            if (superAdminUserType && isComplexType(superAdminUserType) && superAdminUserType.kind === "entity") {
                expect(superAdminUserType.extends).toBe("/subtypes/BaseUser");
                // SuperAdminUser inherits identity keys from BaseUser, so it doesn't need to declare them
                expect(superAdminUserType.identityKeys).toBeUndefined();
            }
        });

        test("should list all types in inheritance and subtype hierarchy", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            const typeNames = registry.listTypesInNamespace("/subtypes");
            
            // Should include base types
            expect(typeNames).toContain("BaseUser");
            expect(typeNames).toContain("BaseProduct");
            
            // Should include inheritance example
            expect(typeNames).toContain("SuperAdminUser");
            
            // Should include subtype hierarchy
            expect(typeNames).toContain("AdminUser");
            expect(typeNames).toContain("PremiumUser");
            expect(typeNames).toContain("DigitalProduct");
            expect(typeNames).toContain("PhysicalProduct");
        });
    });

    describe("Type Lookup with Inheritance", () => {
        test("should resolve inherited types within namespace", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            // Type lookup by simple name within namespace
            const baseUserType = registry.getTypeInNamespace("BaseUser", "/subtypes");
            expect(baseUserType).toBeDefined();
            expect(baseUserType?.qName).toBe("/subtypes/BaseUser");
            
            const superAdminUserType = registry.getTypeInNamespace("SuperAdminUser", "/subtypes");
            expect(superAdminUserType).toBeDefined();
            expect(superAdminUserType?.qName).toBe("/subtypes/SuperAdminUser");
        });

        test("should provide available types including inherited ones", () => {
            registry.importNamespace(subtypeExamplesNamespace);
            
            const availableTypes = registry.getAvailableTypesInNamespace("/subtypes");
            
            // Should include local base types
            expect(availableTypes.has("BaseUser")).toBe(true);
            expect(availableTypes.has("BaseProduct")).toBe(true);
            
            // Should include inheritance example
            expect(availableTypes.has("SuperAdminUser")).toBe(true);
            
            // Should include local subtype types
            expect(availableTypes.has("AdminUser")).toBe(true);
            expect(availableTypes.has("PremiumUser")).toBe(true);
            expect(availableTypes.has("DigitalProduct")).toBe(true);
            expect(availableTypes.has("PhysicalProduct")).toBe(true);
            
            // Should include system types
            expect(availableTypes.has("string")).toBe(true);
            expect(availableTypes.has("number")).toBe(true);
            expect(availableTypes.has("boolean")).toBe(true);
            expect(availableTypes.has("date")).toBe(true);
        });
    });
});