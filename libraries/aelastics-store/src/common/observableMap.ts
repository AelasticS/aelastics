/*
 * Project: aelastics-store
 * Created Date: Tuesday September 12th 2023
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

export interface MapHandlers<K, V> {
    set?: (target: Map<K, V>, key: K, value: V) => boolean;
    delete?: (target: Map<K, V>, key: K) => boolean;
    clear?: (target: Map<K, V>) => boolean;
    defaultAction?: (target: Map<K, V>, key: PropertyKey) => boolean;
}

export function createObservableMap<K, V>(
    map: Map<K, V>,
    handlers: MapHandlers<K, V>,
    defaultMutation: boolean = true
): Map<K, V> {
    return new Proxy(map, {
        get(target: Map<K, V>, key: PropertyKey) {
            switch (key) {
                case 'set':
                    return function (k: K, v: V): void {
                        if (handlers.set) {
                            const allowMutation = handlers.set(target, k, v);
                            if (allowMutation) {
                                target.set(k, v);
                            }
                        } else if (defaultMutation) {
                            target.set(k, v);
                        }
                    };
                case 'delete':
                    return function (k: K): boolean {
                        if (handlers.delete) {
                            const allowMutation = handlers.delete(target, k);
                            if (allowMutation) {
                                return target.delete(k);
                            }
                            return false;  // Or whatever default behavior you want when mutation is not allowed
                        } else if (defaultMutation) {
                            return target.delete(k);
                        }
                        return false;  // Default behavior if no delete handler and defaultMutation is false
                    };
                case 'clear':
                    return function (): void {
                        if (handlers.clear) {
                            const allowMutation = handlers.clear(target);
                            if (allowMutation) {
                                target.clear();
                            }
                        } else if (defaultMutation) {
                            target.clear();
                        }
                    };
                case 'get':
                    return function (k: K): V | undefined {
                        return target.get(k);
                    };
                default:
                    if (handlers.defaultAction) {
                        const allowDefault = handlers.defaultAction(target, key);
                        if (!allowDefault) {
                            return undefined;
                        }
                    }
                    return target[key as keyof typeof target];
            }
        }
    });
}
