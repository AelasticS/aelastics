import { promises as fs } from "fs";
import path from "path";

/**
 * Loads a module's source code from a file.
 * @param filePath - The path to the file.
 * @returns The module source code as a string.
 */
export async function loadModuleFromFile(filePath: string): Promise<string> {
    const absolutePath = path.resolve(filePath);
    return await fs.readFile(absolutePath, "utf8");
}

