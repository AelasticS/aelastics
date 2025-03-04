export interface MapHandlers<K, V> {
    set?: (target: Map<K, V>, key: K, value: V) => [boolean, any];
    delete?: (target: Map<K, V>, key: K) => [boolean, boolean];
    clear?: (target: Map<K, V>) => [boolean, undefined];
    get?: (target: Map<K, V>, key: K) => [boolean, V];
    has?: (target: Map<K, V>, key: K) => [boolean, boolean];
    forEach?: (target: Map<K, V>, callback: (value: V, key: K, map: Map<K, V>) => void) => [boolean, any];
    entries?: (target: Map<K, V>) => [boolean, IterableIterator<[K, V]>];
    keys?: (target: Map<K, V>) => [boolean, IterableIterator<K>];
    values?: (target: Map<K, V>) => [boolean, IterableIterator<V>?];
    size?: (target: Map<K, V>) => [boolean, number];
    [Symbol.iterator]?: (target: Map<K, V>) => [boolean, IterableIterator<[K, V]>];
}

export function createObservableMap<K, V,>(
    map: Map<K, V>,
    handlers: MapHandlers<K, V>,
    allowMutation: boolean = true
): Map<K, V> {
    return new Proxy(map, {
        get(target: Map<K, V>, key: string | number | symbol, receiver: any): any {
            // Handle standard map methods
            if (typeof key === 'string') {
                switch (key) {
                    case 'set':
                        return (k: K, v: V) => {
                            const [proceed, result] = handlers.set?.(target, k, v) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.set, target, [k, v]) : result;
                        };
                    case 'delete':
                        return (k: K) => {
                            const [proceed, result] = handlers.delete?.(target, k) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.delete, target, [k]) : result;
                        };
                    case 'clear':
                        return () => {
                            const [proceed, result] = handlers.clear?.(target) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.clear, target, []) : result;
                        };
                    case 'get':
                        return (k: K) => {
                            const [proceed, result] = handlers.get?.(target, k) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.get, target, [k]) : result;
                        };
                    case 'has':
                        return (k: K) => {
                            const [proceed, result] = handlers.has?.(target, k) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.has, target, [k]) : result;
                        };
                    case 'forEach':
                        return (callback: (value: V, key: K, map: Map<K, V>) => void) => {
                            const [proceed, result] = handlers.forEach?.(target, callback) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.forEach, target, [callback]) : result;
                        };
                    case 'entries':
                        return () => {
                            const [proceed, result] = handlers.entries?.(target) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.entries, target, []) : result;
                        };
                    case 'keys':
                        return () => {
                            const [proceed, result] = handlers.keys?.(target) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.keys, target, []) : result;
                        };
                    case 'values':
                        return () => {
                            const [proceed, result] = handlers.values?.(target) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.values, target, []) : result;
                        };
                    case 'size':
                        const [proceed, result] = handlers.values?.(target) ?? [allowMutation, undefined];
                        return proceed ? target.size : result;
                }
            }
            else if (typeof key === 'symbol') {
                switch (key) {
                    case Symbol.iterator:
                        return (k: K, v: V) => {
                            const [proceed, result] =  handlers[Symbol.iterator]?.(target) ?? [allowMutation, undefined];
                            return proceed ? Reflect.apply(target.set, target , [k,v]) : result;
                        }
                }

            }
            return Reflect.get(target, key, receiver);
        }
    });
}
