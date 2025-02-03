import { executeModuleNode } from "../executeModuleNode";
import { loadModuleFromFile } from "../loadModuleFromFile";
import { onBeforeExecute, onAfterExecute, onModuleLoaded, onErrorExecute } from "../hookSystem";
import path from "path";
import fs from "fs/promises";

const tempFilePath = path.join(__dirname, "data", "mockModule.js");

describe("loadModuleFromFile with Hooks", () => {
    let beforeExecuteCalled = false;
    let afterExecuteCalled = false;
    let moduleLoadedCalled = false;
    let errorTriggered = false;

    beforeAll(async () => {
        // ✅ Create mock module before tests
        await fs.writeFile(
            tempFilePath,
            `"use strict"; globalThis.testModule = { name: "TestModule", process: () => "Hello" };`
        );

        // ✅ Register hooks
        onBeforeExecute((code) => {
            beforeExecuteCalled = true;
            return code; // No transformation applied
        });

        onAfterExecute((_moduleName, executionTime) => {
            afterExecuteCalled = true;
            expect(typeof executionTime).toBe("number");
        });

        onModuleLoaded((_moduleName) => {
            moduleLoadedCalled = true;
        });

        onErrorExecute(() => {
            errorTriggered = true;
        });
    });

    afterAll(async () => {
        // ✅ Cleanup mock module after tests
        await fs.unlink(tempFilePath).catch(() => {});
    });

    it("should correctly load, execute a module from a file, and trigger hooks", async () => {
        beforeExecuteCalled = false;
        afterExecuteCalled = false;
        moduleLoadedCalled = false;

        const moduleCode = await loadModuleFromFile(tempFilePath);
        const module = await executeModuleNode<{ name: string; process: () => string }>(
            tempFilePath,
            "js",
            "function"
        );

        expect(moduleCode).toBeDefined();
        expect(module).toBeDefined();
        expect(module.name).toBe("TestModule");
        expect(module.process()).toBe("Hello");

        // ✅ Hooks verification
        expect(beforeExecuteCalled).toBe(true);
        expect(afterExecuteCalled).toBe(true);
        expect(moduleLoadedCalled).toBe(true);
    });

    it("should trigger error hook on execution failure", async () => {
        errorTriggered = false;

        await expect(loadModuleFromFile("non-existent.js")).rejects.toThrow();
        expect(errorTriggered).toBe(true);
    });
});
