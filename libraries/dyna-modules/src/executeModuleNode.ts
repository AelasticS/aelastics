import { pathToFileURL } from "url";
import { readFile } from "fs/promises";
import { Script, createContext } from "vm";

/**
 * Executes a dynamically loaded module in Node.js.
 * @param filePath - The file path of the module.
 * @param type - "js" or "ts" (TypeScript support planned).
 * @param mode - Execution mode: "import", "vm", or "function".
 * @returns The exported object from the module.
 */
export async function executeModuleNode<T>(filePath: string, type: "js" | "ts", mode: "import" | "vm" | "function"): Promise<T> {
    if (mode === "import") {
        const moduleUrl = pathToFileURL(filePath).href;
        return (await import(moduleUrl)) as T;
    }

    const code = await readFile(filePath, "utf8");

    if (mode === "vm") {
        const context = createContext({ exports: {} });
        const script = new Script(`"use strict"; ${code}`, { filename: filePath });
        script.runInContext(context);
        return context.exports as T;
    }

    if (mode === "function") {
        const module = new Function("exports", code);
        const exports: any = {};
        module(exports);
        return exports as T;
    }

    throw new Error(`Unsupported execution mode: ${mode}`);
}
