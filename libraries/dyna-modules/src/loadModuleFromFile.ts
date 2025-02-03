import fs from 'fs/promises';
import { triggerModuleLoaded, triggerModuleError } from "./hookSystem";

export async function loadModuleFromFile(filePath: string) {
    try {
        const code = await fs.readFile(filePath, "utf-8");
        triggerModuleLoaded(filePath);
        return code;
    } catch (error) {
        triggerModuleError(error as Error, filePath);
        throw error;
    }
}
