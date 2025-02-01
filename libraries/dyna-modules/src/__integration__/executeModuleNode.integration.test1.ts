import { executeModuleNode } from "../executeModuleNode";
import path from "path";
import { TestModule } from "../__tests__/data/test-module";

describe("executeModuleNode (Integration Test)", () => {
    it("should execute a module with a known structure", async () => {
        const filePath = path.join(__dirname, "../__tests__/data/test-module.js");

        // Load the module and ensure TypeScript knows its type
        const module = await executeModuleNode<TestModule>(filePath, "js", "import");

        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello, World!");
    });
});
