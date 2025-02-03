import { pathToFileURL } from "url";
import { readFile } from "fs/promises";
import { Script, createContext } from "vm";
import { triggerBeforeExecute, triggerAfterExecute, triggerModuleError } from "./hookSystem";

/**
 * Executes a dynamically loaded module in Node.js with lifecycle hooks.
 * @param filePath - The file path of the module.
 * @param type - "js" or "ts" (TypeScript support planned).
 * @param mode - Execution mode: "import", "vm", or "function".
 * @returns The exported object from the module.
 */
export async function executeModuleNode<T>(
    filePath: string,
    type: "js" | "ts",
    mode: "import" | "vm" | "function"
): Promise<T> {
    try {
        if (mode === "import") {
            const moduleUrl = pathToFileURL(filePath).href;
            return (await import(moduleUrl)) as T;
        }

        let code = await readFile(filePath, "utf8");

        // 🔥 Apply `onBeforeExecute` hook before execution
        code = await triggerBeforeExecute(code);

        if (mode === "vm") {
            const context = createContext({ exports: {} });
            const script = new Script(`"use strict"; ${code}`, { filename: filePath });

            const startTime = performance.now();
            script.runInContext(context);
            const executionTime = performance.now() - startTime;

            // 🔥 Apply `onAfterExecute` hook after execution
            triggerAfterExecute(filePath, executionTime);

            return context.exports as T;
        }

        if (mode === "function") {
            const moduleFunction = new Function("exports", code);
            const exports: any = {};

            const startTime = performance.now();
            moduleFunction(exports);
            const executionTime = performance.now() - startTime;

            // 🔥 Apply `onAfterExecute` hook after execution
            triggerAfterExecute(filePath, executionTime);

            return exports as T;
        }

        throw new Error(`Unsupported execution mode: ${mode}`);
    } catch (error) {
        // 🔥 Trigger `onErrorExecute` hook on error
        triggerModuleError(error as Error, filePath);
        throw error;
    }
}
