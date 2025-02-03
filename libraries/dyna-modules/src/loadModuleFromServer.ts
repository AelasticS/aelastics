import { triggerModuleLoaded, triggerModuleError } from "./hookSystem";

export async function loadModuleFromServer(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch module from ${url}`);
        const code = await response.text();
        triggerModuleLoaded(url);
        return code;
    } catch (error) {
        triggerModuleError(error as Error, url);
        throw error;
    }
}
