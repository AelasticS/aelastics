export interface MapHandlers<K, V> {
    set?: (target: Map<K, V>, key: K, value: V) => boolean;
    delete?: (target: Map<K, V>, key: K) => boolean;
    clear?: (target: Map<K, V>) => boolean;
    get?: (target: Map<K, V>, key: K) => boolean;
    has?: (target: Map<K, V>, key: K) => boolean;
    forEach?: (target: Map<K, V>, callback: (value: V, key: K, map: Map<K, V>) => void) => boolean;
    entries?: (target: Map<K, V>) => boolean;
    keys?: (target: Map<K, V>) => boolean;
    values?: (target: Map<K, V>) => boolean;
    size?: (target: Map<K, V>) => boolean;
    [Symbol.iterator]?: (target: Map<K, V>) => boolean;
    defaultAction?: (target: Map<K, V>, key: PropertyKey, args?: any[]) => [boolean, any?];
}

export function createObservableMap<K, V,>(
    map: Map<K, V>,
    handlers: MapHandlers<K, V>,
    defaultMutation: boolean = true
): Map<K, V> {
    return new Proxy(map, {
        get(target: Map<K, V>, key: string | number | symbol, receiver: any): any {
            // Handle standard map methods
            if (typeof key === 'string') {
                switch (key) {
                    case 'set':
                        return (k: K, v: V) => {
                            const allowSet = handlers.set?.(target, k, v) ?? defaultMutation;
                            return allowSet ? Reflect.apply(target.set, target, [k, v]) : target;
                        };
                    case 'delete':
                        return (k: K) => {
                            const allowDelete = handlers.delete?.(target, k) ?? defaultMutation;
                            return allowDelete ? Reflect.apply(target.delete, target, [k]) : false;
                        };
                    case 'clear':
                        return () => {
                            const allowClear = handlers.clear?.(target) ?? defaultMutation;
                            return allowClear ? Reflect.apply(target.clear, target, []) : undefined;
                        };
                    case 'get':
                        return (k: K) => {
                            const allowGet = handlers.get?.(target, k) ?? defaultMutation;
                            return allowGet ? Reflect.apply(target.get, target, [k]) : undefined;
                        };
                    case 'has':
                        return (k: K) => {
                            const allowHas = handlers.has?.(target, k) ?? defaultMutation;
                            return allowHas ? Reflect.apply(target.has, target, [k]) : false;
                        };
                    case 'forEach':
                        return (callback: (value: V, key: K, map: Map<K, V>) => void) => {
                            const allowForEach = handlers.forEach?.(target, callback) ?? defaultMutation;
                            return allowForEach ? Reflect.apply(target.forEach, target, [callback]) : undefined;
                        };
                    case 'entries':
                        return () => {
                            const allowEntries = handlers.entries?.(target) ?? defaultMutation;
                            return allowEntries ? Reflect.apply(target.entries, target, []) : undefined;
                        };
                    case 'keys':
                        return () => {
                            const allowKeys = handlers.keys?.(target) ?? defaultMutation;
                            return allowKeys ? Reflect.apply(target.keys, target, []) : undefined;
                        };
                    case 'values':
                        return () => {
                            const allowValues = handlers.values?.(target) ?? defaultMutation;
                            return allowValues ? Reflect.apply(target.values, target, []) : undefined;
                        };
                    case 'size':
                        if (handlers.size) {
                            const allowSize = handlers.size(target);
                            if (!allowSize) {
                                return undefined;
                            }
                        }
                        return Reflect.get(target, 'size');
  
                }
            }
            else if (typeof key === 'symbol') {
                switch (key) {
                    case Symbol.iterator:
                        return (k: K, v: V) => {
                            const allowSet =  handlers[Symbol.iterator]?.(target) ?? defaultMutation;
                            return allowSet ? Reflect.apply(target.set, target , [k,v]) : target;
                        }
                    default:
                        return Reflect.get(target, key, receiver);
                }

            }
            if (handlers.defaultAction) {
                const [continueOperationDefault, defaultResult] = handlers.defaultAction(target, key, [receiver]);
                if (!continueOperationDefault) {
                    return defaultResult;
                }
            }
        }
    });
}
