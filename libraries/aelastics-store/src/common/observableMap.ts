export interface MapHandlers<K, V, P extends {} = {}> {
    set?: (target: Map<K, V>, key: K, value: V, extra?: P) => boolean;
    delete?: (target: Map<K, V>, key: K, extra?: P) => boolean;
    clear?: (target: Map<K, V>, extra?: P) => boolean;
    get?: (target: Map<K, V>, key: K, extra?: P) => boolean;
    has?: (target: Map<K, V>, key: K, extra?: P) => boolean;
    forEach?: (target: Map<K, V>, callback: (value: V, key: K, map: Map<K, V>) => void, extra?: P) => boolean;
    defaultAction?: (target: Map<K, V>, key: PropertyKey, args?: any[], extra?: P) => boolean;
}

export function createObservableMap<K, V, P extends {} = {}>(
    map: Map<K, V>,
    handlers: MapHandlers<K, V, P>,
    defaultMutation: boolean = true,
    extra?: P
): Map<K, V> {
    return new Proxy(map, {
        get(target: Map<K, V>, key: string | number | symbol, receiver: any): any {
            // Handle standard map methods
            if (typeof key === 'string') {
                switch (key) {
                    case 'set':
                        return (k: K, v: V) => {
                            const allowSet = handlers.set?.(target, k, v, extra) ?? defaultMutation;
                            return allowSet ? Reflect.apply(target.set, target, [k, v]) : target;
                        };
                    case 'delete':
                        return (k: K) => {
                            const allowDelete = handlers.delete?.(target, k, extra) ?? defaultMutation;
                            return allowDelete ? Reflect.apply(target.delete, target, [k]) : false;
                        };
                    case 'clear':
                        return () => {
                            const allowClear = handlers.clear?.(target, extra) ?? defaultMutation;
                            return allowClear ? Reflect.apply(target.clear, target, []) : undefined;
                        };
                    case 'get':
                        return (k: K) => {
                            const allowGet = handlers.get?.(target, k, extra) ?? defaultMutation;
                            return allowGet ? Reflect.apply(target.get, target, [k]) : undefined;
                        };
                    case 'has':
                        return (k: K) => {
                            const allowHas = handlers.has?.(target, k, extra) ?? defaultMutation;
                            return allowHas ? Reflect.apply(target.has, target, [k]) : false;
                        };
                    case 'forEach':
                        return (callback: (value: V, key: K, map: Map<K, V>) => void) => {
                            const allowForEach = handlers.forEach?.(target, callback, extra) ?? defaultMutation;
                            return allowForEach ? Reflect.apply(target.forEach, target, [callback]) : undefined;
                        };
                }
            }

            // Handle property getters like `size`
            const propDescriptor = Object.getOwnPropertyDescriptor(Map.prototype, key);
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

