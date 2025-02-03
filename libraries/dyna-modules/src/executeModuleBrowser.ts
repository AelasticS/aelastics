import { triggerBeforeExecute, triggerAfterExecute, triggerModuleError } from "./hookSystem";

export async function executeModuleBrowser(moduleCode: string, moduleName: string) {
    try {
        const startTime = performance.now();
        const transformedCode = await triggerBeforeExecute(moduleCode);

        const moduleFunction = new Function("exports", transformedCode);
        const exports: any = {};
        moduleFunction(exports);

        const executionTime = performance.now() - startTime;
        triggerAfterExecute(moduleName, executionTime);

        return exports;
    } catch (error) {
        triggerModuleError(error as Error, moduleName);
        throw error;
    }
}
