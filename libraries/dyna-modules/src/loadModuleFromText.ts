import { triggerModuleLoaded } from "./hookSystem";

export function loadModuleFromText(code: string, moduleName: string) {
    triggerModuleLoaded(moduleName);
    return code;
}
