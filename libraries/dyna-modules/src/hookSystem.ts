type BeforeExecuteHook = (code: string) => string | Promise<string>;
type AfterExecuteHook = (moduleName: string, executionTime: number) => void;
type ErrorHook = (error: Error, moduleName: string) => void;
type ModuleLoadedHook = (moduleName: string) => void;

const beforeExecuteHooks: BeforeExecuteHook[] = [];
const afterExecuteHooks: AfterExecuteHook[] = [];
const errorHooks: ErrorHook[] = [];
const moduleLoadedHooks: ModuleLoadedHook[] = [];

/**
 * Registers a hook to modify the module's code before execution.
 * @param hook - A function that receives the code and returns the modified code.
 */
export function onBeforeExecute(hook: BeforeExecuteHook) {
    beforeExecuteHooks.push(hook);
}

/**
 * Registers a hook that is triggered after module execution.
 * @param hook - A function that receives module name and execution time.
 */
export function onAfterExecute(hook: AfterExecuteHook) {
    afterExecuteHooks.push(hook);
}

/**
 * Registers a hook that is triggered when an execution error occurs.
 * @param hook - A function that receives the error and module name.
 */
export function onErrorExecute(hook: ErrorHook) {
    errorHooks.push(hook);
}

/**
 * Registers a hook that is triggered when a module is successfully loaded.
 * @param hook - A function that receives the module name.
 */
export function onModuleLoaded(hook: ModuleLoadedHook) {
    moduleLoadedHooks.push(hook);
}

/**
 * Internal function: Applies all before-execution hooks to modify the code.
 * @param code - The module code.
 * @returns The transformed code after applying hooks.
 */
export async function triggerBeforeExecute(code: string): Promise<string> {
    let modifiedCode = code;
    for (const hook of beforeExecuteHooks) {
        modifiedCode = await hook(modifiedCode);
    }
    return modifiedCode;
}

/**
 * Internal function: Triggers all after-execution hooks.
 * @param moduleName - The name of the executed module.
 * @param executionTime - The execution time in milliseconds.
 */
export function triggerAfterExecute(moduleName: string, executionTime: number) {
    for (const hook of afterExecuteHooks) {
        hook(moduleName, executionTime);
    }
}

/**
 * Internal function: Triggers all error hooks when execution fails.
 * @param error - The error object.
 * @param moduleName - The name of the module that caused the error.
 */
export function triggerModuleError(error: Error, moduleName: string) {
    for (const hook of errorHooks) {
        hook(error, moduleName);
    }
}

/**
 * Internal function: Triggers all module loaded hooks.
 * @param moduleName - The name of the loaded module.
 */
export function triggerModuleLoaded(moduleName: string) {
    for (const hook of moduleLoadedHooks) {
        hook(moduleName);
    }
}
