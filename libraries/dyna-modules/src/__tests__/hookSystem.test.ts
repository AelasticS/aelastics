import { onModuleLoaded, onBeforeExecute, onAfterExecute, onErrorExecute, triggerModuleLoaded, triggerBeforeExecute, triggerAfterExecute, triggerModuleError } from "../hookSystem";

describe("Hook System", () => {
    it("should call onModuleLoaded hooks", () => {
        let called = false;
        onModuleLoaded((moduleName) => {
            expect(moduleName).toBe("TestModule");
            called = true;
        });
        triggerModuleLoaded("TestModule");
        expect(called).toBe(true);
    });

    it("should modify code in onBeforeExecute hooks", async () => {
        onBeforeExecute((code) => code.replace("console.log", "customLogger"));
        const modifiedCode = await triggerBeforeExecute("console.log('Hello');");
        expect(modifiedCode).toBe("customLogger('Hello');");
    });

    it("should call onAfterExecute hooks with execution time", () => {
        let called = false;
        onAfterExecute((moduleName, executionTime) => {
            expect(moduleName).toBe("TestModule");
            expect(typeof executionTime).toBe("number");
            called = true;
        });
        triggerAfterExecute("TestModule", 123);
        expect(called).toBe(true);
    });

    it("should call onModuleError hooks on error", () => {
        let called = false;
        onErrorExecute((error, moduleName) => {
            expect(moduleName).toBe("TestModule");
            expect(error.message).toBe("Test error");
            called = true;
        });
        triggerModuleError(new Error("Test error"), "TestModule");
        expect(called).toBe(true);
    });
});
