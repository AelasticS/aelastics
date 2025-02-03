import { executeModuleNode } from "../executeModuleNode";
import { onBeforeExecute, onAfterExecute, onModuleLoaded, onErrorExecute } from "../hookSystem";

describe("loadModuleFromText with Hooks", () => {
    let beforeExecuteCalled = false;
    let afterExecuteCalled = false;
    let moduleLoadedCalled = false;
    let errorTriggered = false;

    const moduleCode = `"use strict"; globalThis.testModule = { name: "TestModule", process: () => "Hello" };`;

    beforeAll(() => {
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

    it("should execute module from direct text input and trigger hooks", async () => {
        beforeExecuteCalled = false;
        afterExecuteCalled = false;
        moduleLoadedCalled = false;

        const module = await executeModuleNode<{ name: string; process: () => string }>(
            moduleCode,
            "js",
            "function"
        );

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

        await expect(executeModuleNode("invalid code", "js", "function")).rejects.toThrow();
        expect(errorTriggered).toBe(true);
    });
});
