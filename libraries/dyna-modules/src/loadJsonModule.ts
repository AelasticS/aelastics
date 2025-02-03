import { triggerModuleLoaded, triggerModuleError } from "./hookSystem";

export function loadJsonModule(jsonString: string, moduleName: string) {
    try {
        const json = JSON.parse(jsonString);
        triggerModuleLoaded(moduleName);
        return json;
    } catch (error) {
        triggerModuleError(error as Error, moduleName);
        throw error;
    }
}
