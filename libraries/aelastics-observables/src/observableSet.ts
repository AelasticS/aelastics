export interface SetHandlers<T> {
    add?: (target: Set<T>, value: T) => [boolean, Set<T>];
    delete?: (target: Set<T>, value: T) => [boolean, boolean];
    clear?: (target: Set<T>) => [boolean, undefined];
    has?: (target: Set<T>, value: T) => [boolean, boolean];
    forEach?: (target: Set<T>, callback: (value: T, value2: T, set: Set<T>) => void) => [boolean, void];
    entries?: (target: Set<T>) => [boolean, IterableIterator<[T, T]>];
    keys?: (target: Set<T>) => [boolean, IterableIterator<T>];
    values?: (target: Set<T>) => [boolean, IterableIterator<T>];
    size?: (target: Set<T>) => [boolean, number];
    [Symbol.iterator]?: (target: Set<T>) => [boolean, IterableIterator<T>];
    [Symbol.toStringTag]?: (target: Set<T>) => [boolean, string];
}

export function createObservableSet<T>(
    set: Set<T>,
    handlers: SetHandlers<T>,
    defaultMutation: boolean = true,
): Set<T> {
    return new Proxy(set, {
        get(target: Set<T>, key: string | number | symbol, receiver: any): any {
            if (typeof key === 'string') {
                switch (key) {
                    case 'add':
                        return (value: T) => {
                            const [allowAdd, result] = handlers.add?.(target, value) ?? [defaultMutation, target];
                            return allowAdd ? Reflect.apply(target.add, target, [value]) : result;
                        };
                    case 'delete':
                        return (value: T) => {
                            const [allowDelete, result] = handlers.delete?.(target, value) ?? [defaultMutation, false];
                            return allowDelete ? Reflect.apply(target.delete, target, [value]) : result;
                        };
                    case 'clear':
                        return () => {
                            const [allowClear, result] = handlers.clear?.(target) ?? [defaultMutation, undefined];
                            return allowClear ? Reflect.apply(target.clear, target, []) : result;
                        };
                    case 'has':
                        return (value: T) => {
                            const [allowHas, result] = handlers.has?.(target, value) ?? [defaultMutation, false];
                            return allowHas ? Reflect.apply(target.has, target, [value]) : result;
                        };
                    case 'forEach':
                        return (callback: (value: T, value2: T, set: Set<T>) => void) => {
                            const [allowForEach, result] = handlers.forEach?.(target, callback) ?? [defaultMutation, undefined];
                            return allowForEach ? Reflect.apply(target.forEach, target, [callback]) : result;
                        };
                    case 'entries':
                        return () => {
                            const [allowEntries, result] = handlers.entries?.(target) ?? [defaultMutation, target.entries()];
                            return allowEntries ? Reflect.apply(target.entries, target, []) : result;
                        };
                    case 'keys':
                        return () => {
                            const [allowKeys, result] = handlers.keys?.(target) ?? [defaultMutation, target.keys()];
                            return allowKeys ? Reflect.apply(target.keys, target, []) : result;
                        };
                    case 'values':
                        return () => {
                            const [allowValues, result] = handlers.values?.(target) ?? [defaultMutation, target.values()];
                            return allowValues ? Reflect.apply(target.values, target, []) : result;
                        };
                    case 'size':
                        const [proceed, result] = handlers.values?.(target) ?? [defaultMutation, undefined]
                        return proceed ? target.size : result

                }
            }

            // Handle Symbol.iterator
            if (key === Symbol.iterator) {
                const [allowIterator, result] = handlers[Symbol.iterator]?.(target) ?? [defaultMutation, target[Symbol.iterator]()];
                return allowIterator ? Reflect.apply(target[Symbol.iterator], target, []) : result;
            }

            // Handle Symbol.toStringTag
            if (key === Symbol.toStringTag) {
                const [allowToStringTag, result] = handlers[Symbol.toStringTag]?.(target) ?? [defaultMutation, 'Set'];
                return allowToStringTag ? Reflect.get(target, Symbol.toStringTag) : result;
            }

            // Default behavior for other properties
            console.warn(`Unhandled property ${key.toString()} in Set`);
        }
    });
}