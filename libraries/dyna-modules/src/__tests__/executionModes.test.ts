import { executeModuleNode } from "../executeModuleNode";
import { onBeforeExecute, onAfterExecute, onErrorExecute } from "../hookSystem";
import path from "path";
import fs from "fs/promises";''


const mockModulePath = path.join(__dirname, "data", "mockModule.js");

describe("executeModuleNode", () => {
    beforeAll(async () => {
        // ✅ Ensure mockModule.js exists before tests
        await fs.writeFile(
            mockModulePath,
            `"use strict"; globalThis.testModule = { name: "TestModule", process: () => "Hello" };`
        );
    });

    afterAll(async () => {
        // ✅ Clean up mock module after tests
        await fs.unlink(mockModulePath).catch(() => {});
    });

    it("should load and execute a module using 'import' mode", async () => {
        const module = await executeModuleNode<{ name: string; process: () => string }>(
            mockModulePath,
            "js",
            "import"
        );

        expect(module).toBeDefined();
        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello");
    });

    it("should execute a module using 'vm' mode", async () => {
        const module = await executeModuleNode<{ name: string; process: () => string }>(
            mockModulePath,
            "js",
            "vm"
        );

        expect(module).toBeDefined();
        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello");
    });

    it("should execute a module using 'function' mode", async () => {
        const module = await executeModuleNode<{ name: string; process: () => string }>(
            mockModulePath,
            "js",
            "function"
        );

        expect(module).toBeDefined();
        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello");
    });

    it("should trigger hooks correctly", async () => {
        let beforeExecuteCalled = false;
        let afterExecuteCalled = false;
        let errorTriggered = false;

        onBeforeExecute((code) => {
            beforeExecuteCalled = true;
            return code;
        });

        onAfterExecute(() => {
            afterExecuteCalled = true;
        });

        onErrorExecute(() => {
            errorTriggered = true;
        });

        await executeModuleNode<{ name: string; process: () => string }>(mockModulePath, "js", "function");

        expect(beforeExecuteCalled).toBe(true);
        expect(afterExecuteCalled).toBe(true);
        expect(errorTriggered).toBe(false);
    });

    it("should trigger error hook on failure", async () => {
        let errorTriggered = false;
        onErrorExecute(() => {
            errorTriggered = true;
        });

        await expect(executeModuleNode("non-existent.js", "js", "import")).rejects.toThrow();

        expect(errorTriggered).toBe(true);
    });
});
