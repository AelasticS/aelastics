export interface SetHandlers<T, P extends {} = {}> {
    add?: (target: Set<T>, value: T, extra?: P) => boolean;
    delete?: (target: Set<T>, value: T, extra?: P) => boolean;
    clear?: (target: Set<T>, extra?: P) => boolean;
    has?: (target: Set<T>, value: T, extra?: P) => boolean;
    forEach?: (target: Set<T>, callback: (value: T, value2: T, set: Set<T>) => void, extra?: P) => boolean;
    defaultAction?: (target: Set<T>, key: PropertyKey, args?: any[], extra?: P) => boolean;
}

export function createObservableSet<T, P extends {} = {}>(
    set: Set<T>,
    handlers: SetHandlers<T, P>,
    defaultMutation: boolean = true,
    extra?: P
): Set<T> {
    return new Proxy(set, {
        get(target: Set<T>, key: string | number | symbol, receiver: any): any {
            if (typeof key === 'string') {
                switch (key) {
                    case 'add':
                        return (value: T) => {
                            const allowAdd = handlers.add?.(target, value, extra) ?? defaultMutation;
                            return allowAdd ? Reflect.apply(target.add, target, [value]) : target;
                        };
                    case 'delete':
                        return (value: T) => {
                            const allowDelete = handlers.delete?.(target, value, extra) ?? defaultMutation;
                            return allowDelete ? Reflect.apply(target.delete, target, [value]) : false;
                        };
                    case 'clear':
                        return () => {
                            const allowClear = handlers.clear?.(target, extra) ?? defaultMutation;
                            return allowClear ? Reflect.apply(target.clear, target, []) : undefined;
                        };
                    case 'has':
                        return (value: T) => {
                            const allowHas = handlers.has?.(target, value, extra) ?? defaultMutation;
                            return allowHas ? Reflect.apply(target.has, target, [value]) : false;
                        };
                    case 'forEach':
                        return (callback: (value: T, value2: T, set: Set<T>) => void) => {
                            const allowForEach = handlers.forEach?.(target, callback, extra) ?? defaultMutation;
                            return allowForEach ? Reflect.apply(target.forEach, target, [callback]) : undefined;
                        };
                }
            }

            // Handle property getters like `size`
            const propDescriptor = Object.getOwnPropertyDescriptor(Set.prototype, key);
            if (propDescriptor?.get) {
                if (handlers.defaultAction) {
                    const allowDefault = handlers.defaultAction(target, key, [], extra);
                    if (!allowDefault) {
                        return undefined;
                    }
                }
                return Reflect.get(target, key);
            }

            // Default behavior for other properties
            const origProp = Reflect.get(target, key, receiver);
            if (handlers.defaultAction) {
                const allowDefault = handlers.defaultAction(target, key, [], extra);
                if (!allowDefault) {
                    return undefined;
                }
            }
            return origProp;
        }
    });
}
