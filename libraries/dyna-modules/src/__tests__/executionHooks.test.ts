import { executeModuleNode } from "../executeModuleNode";
import { onBeforeExecute, onAfterExecute, onErrorExecute, onModuleLoaded } from "../hookSystem";
import path from "path";
import fs from "fs/promises";

const mockModulePath = path.join(__dirname, "data", "mockModule.js");

describe("Execution Hooks", () => {
    let beforeExecuteCalled = false;
    let afterExecuteCalled = false;
    let errorTriggered = false;
    let moduleLoadedCalled = false;

    beforeAll(async () => {
        // ✅ Ensure mockModule.js exists before tests
        await fs.writeFile(
            mockModulePath,
            `"use strict"; globalThis.testModule = { name: "TestModule", process: () => "Hello" };`
        );

        // ✅ Register hooks
        onBeforeExecute((code) => {
            beforeExecuteCalled = true;
            return code; // No transformation for now
        });

        onAfterExecute((_moduleName, executionTime) => {
            afterExecuteCalled = true;
            expect(typeof executionTime).toBe("number");
        });

        onErrorExecute(() => {
            errorTriggered = true;
        });

        onModuleLoaded((_moduleName) => {
            moduleLoadedCalled = true;
        });
    });

    afterAll(async () => {
        // ✅ Clean up mock module after tests
        await fs.unlink(mockModulePath).catch(() => {});
    });

    it("should execute in 'import' mode with hooks", async () => {
        beforeExecuteCalled = false;
        afterExecuteCalled = false;
        moduleLoadedCalled = false;

        const module = await executeModuleNode<{ name: string; process: () => string }>(
            mockModulePath,
            "js",
            "import"
        );

        expect(module).toBeDefined();
        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello");

        expect(beforeExecuteCalled).toBe(true);
        expect(afterExecuteCalled).toBe(true);
        expect(moduleLoadedCalled).toBe(true);
    });

    it("should execute in 'vm' mode with hooks", async () => {
        beforeExecuteCalled = false;
        afterExecuteCalled = false;
        moduleLoadedCalled = false;

        const module = await executeModuleNode<{ name: string; process: () => string }>(
            mockModulePath,
            "js",
            "vm"
        );

        expect(module).toBeDefined();
        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello");

        expect(beforeExecuteCalled).toBe(true);
        expect(afterExecuteCalled).toBe(true);
        expect(moduleLoadedCalled).toBe(true);
    });

    it("should execute in 'function' mode with hooks", async () => {
        beforeExecuteCalled = false;
        afterExecuteCalled = false;
        moduleLoadedCalled = false;

        const module = await executeModuleNode<{ name: string; process: () => string }>(
            mockModulePath,
            "js",
            "function"
        );

        expect(module).toBeDefined();
        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello");

        expect(beforeExecuteCalled).toBe(true);
        expect(afterExecuteCalled).toBe(true);
        expect(moduleLoadedCalled).toBe(true);
    });

    it("should trigger error hook on execution failure", async () => {
        errorTriggered = false;

        await expect(executeModuleNode("non-existent.js", "js", "import")).rejects.toThrow();

        expect(errorTriggered).toBe(true);
    });
});
