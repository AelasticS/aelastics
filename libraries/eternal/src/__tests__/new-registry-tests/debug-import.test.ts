import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { coreNamespace } from "../example-namespaces/core-namespace";

describe("Debug Import Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    test("should debug namespace import validation", () => {
        try {
            registry.importNamespace(coreNamespace);
            console.log("Import successful");
        } catch (error) {
            if (error instanceof NamespaceImportError) {
                console.log("Validation errors:", error.validationResult.errors);
                console.log("Validation warnings:", error.validationResult.warnings);
            }
            throw error;
        }
    });
});