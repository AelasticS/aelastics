export interface ArrayHandlers<T, P extends {} = {}> {
    set?: (target: T[], index: number, value: T, extra?: P) => [boolean, T];
    delete?: (target: T[], index: number, extra?: P) => [boolean, boolean];
    push?: (target: T[], items: T[], extra?: P) => [boolean, number?];
    pop?: (target: T[], extra?: P) => [boolean, T?];
    shift?: (target: T[], extra?: P) => [boolean, T?];
    unshift?: (target: T[], items: T[], extra?: P) => [boolean, number?];
    splice?: (target: T[], start: number, deleteCount: number, items: T[], extra?: P) => [boolean, T[]?];
    reverse?: (target: T[], extra?: P) => [boolean, T[]?];
    sort?: (target: T[], extra?: P) => [boolean, T[]?];
    fill?: (target: T[], value: T, start: number, end: number, extra?: P) => [boolean, T[]?];
    length?: (target: T[], length: number, extra?: P) => [boolean, number?];
    size?: (target: T[], size: number, extra?: P) => [boolean, number?];
    includes?: (target: T[], value: T, extra?: P) => [boolean, boolean?];
    indexOf?: (target: T[], value: T, fromIndex: number, extra?: P) => [boolean, number];
    lastIndexOf?: (target: T[], value: T, fromIndex: number, extra?: P) => [boolean, number];
    find?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: P) => [boolean, T?];
    findIndex?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: P) => [boolean, number?];
    concat?: (target: T[], items: T[], extra?: P) => [boolean, T[]];
    slice?: (target: T[], start?: number, end?: number, extra?: P) => [boolean, T[]];
    map?: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any, extra?: P) => [boolean, any[]?];
    filter?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: P) => [boolean, T[]?];
    reduce?: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any, extra?: P) => [boolean, any?];
    reduceRight?: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any, extra?: P) => [boolean, any?];
    every?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: P) => [boolean, boolean?];
    some?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: P) => [boolean, boolean?];
    forEach?: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any, extra?: P) => [boolean, void?];
    flatMap?: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any, extra?: P) => [boolean, any[]?];
    flat?: (target: T[], depth: number, extra?: P) => [boolean, any[]?];
    copyWithin?: (target: T[], targetIndex: number, start: number, end: number, extra?: P) => [boolean, T[]?];
    entries?: (target: T[], extra?: P) => [boolean, IterableIterator<[number, T]>?];
    keys?: (target: T[], extra?: P) => [boolean, IterableIterator<number>?];
    values?: (target: T[], extra?: P) => [boolean, IterableIterator<T>?];
    join?: (target: T[], separator: string, extra?: P) => [boolean, string?];
    // toString?: (target: T[], extra?: P) => [boolean, string?];
    // toLocaleString?: (target: T[], extra?: P) => [boolean, string?];
    defaultAction?: (target: T[], key: PropertyKey, args?: any[], extra?: P) => [boolean, any?];
}

export function createObservableArray<T, P extends {} = {}>(
    arr: T[],
    handlers: ArrayHandlers<T, P>,
    defaultMutation: boolean = true,
    extra?: P
): T[] {
    return new Proxy(arr, {
        set(target: T[], key: string | number | symbol, value: any, receiver: any): any {
            if (typeof key === 'number' || !isNaN(Number(key))) {
                const index = Number(key);
                if (handlers.set) {
                    const [continueOperation, result] = handlers.set(target, index, value, extra);
                    if (!continueOperation) {
                        return result;
                    }
                }
                Reflect.set(target, index, value, receiver);
            } else if (handlers.defaultAction) {
                const [continueOperation, result] = handlers.defaultAction(target, key, [], extra);
                if (!continueOperation) {
                    return result;
                }
            }
            return value;
        },

        deleteProperty(target: T[], key: string | number | symbol): boolean {
            if (typeof key === 'number' || !isNaN(Number(key))) {
                const index = Number(key);
                if (handlers.delete) {
                    const [continueOperation, result] = handlers.delete(target, index, extra);
                    if (!continueOperation) {
                        return result;
                    }
                }
                return Reflect.deleteProperty(target, index);
            } else if (handlers.defaultAction) {
                const [continueOperation, result] = handlers.defaultAction(target, key, [], extra);
                if (!continueOperation) {
                    return result !== undefined ? result : false;
                }
            }
            return true;
        },

        get(target: T[], key: string | number | symbol, receiver: any): any {
            const origProp = Reflect.get(target, key, receiver);

            if (typeof key === 'string') {
                switch (key) {
                    case 'push':
                        return (...items: T[]) => {
                            const [continueOperation, result] = handlers.push?.(target, items, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.push, target, items);
                        };
                    case 'pop':
                        return () => {
                            const [continueOperation, result] = handlers.pop?.(target, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.pop, target, []);
                        };
                    case 'shift':
                        return () => {
                            const [continueOperation, result] = handlers.shift?.(target, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.shift, target, []);
                        };
                    case 'unshift':
                        return (...items: T[]) => {
                            const [continueOperation, result] = handlers.unshift?.(target, items, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.unshift, target, items);
                        };
                    case 'splice':
                        return (start: number, deleteCount: number, ...items: T[]) => {
                            const [continueOperation, result] = handlers.splice?.(target, start, deleteCount, items, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.splice, target, [start, deleteCount, ...items]);
                        };
                    case 'reverse':
                        return () => {
                            const [continueOperation, result] = handlers.reverse?.(target, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.reverse, target, []);
                        };
                    case 'sort':
                        return (compareFn?: (a: T, b: T) => number) => {
                            const [continueOperation, result] = handlers.sort?.(target, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.sort, target, [compareFn]);
                        };
                    case 'fill':
                        return (value: T, start: number = 0, end?: number) => {
                            const [continueOperation, result] = handlers.fill?.(target, value, start, end ?? target.length, extra) ?? [defaultMutation, undefined];
                            if (!continueOperation) {
                                return result;
                            }
                            return Reflect.apply(Array.prototype.fill, target, [value, start, end]);
                        };
                    case 'length':
                        const [continueOperationLength, lengthResult] = handlers.length?.(target, target.length, extra) ?? [defaultMutation, undefined];
                        if (!continueOperationLength) {
                            return lengthResult;
                        }
                        return Reflect.get(target, 'length');
                    case 'size':
                        const [continueOperationSize, sizeResult] = handlers.size?.(target, target.length, extra) ?? [defaultMutation, undefined];
                        if (!continueOperationSize) {
                            return sizeResult;
                        }
                        return Reflect.get(target, 'size');
                    case 'includes':
                        return (value: T) => {
                            const [continueOperationIncludes, includesResult] = handlers.includes?.(target, value, extra) ?? [defaultMutation, undefined];
                            if (!continueOperationIncludes) {
                                return includesResult;
                            }
                            return target.includes(value);
                        }
                    case 'indexOf':
                        return (value: T, fromIndex: number = 0) => {
                            const [continueOperationIndexOf, indexOfResult] = handlers.indexOf?.(target, value, fromIndex, extra) ?? [defaultMutation, undefined];
                            if (!continueOperationIndexOf) {
                                return indexOfResult;
                            }
                            return target.indexOf(value, fromIndex);
                        }
                    case 'lastIndexOf':
                        return (value: T, fromIndex: number = target.length - 1) => {
                            const [continueOperationLastIndexOf, lastIndexOfResult] = handlers.lastIndexOf?.(target, value, fromIndex, extra) ?? [defaultMutation, undefined];
                            if (!continueOperationLastIndexOf) {
                                return lastIndexOfResult;
                            }
                            return target.lastIndexOf(value, fromIndex);
                        }
                    case 'find':
                        return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
                            const [continueOperationFind, findResult] = handlers.find?.(target, callback, thisArg, extra) ?? [defaultMutation, undefined];
                            if (!continueOperationFind) {
                                return findResult;
                            }
                            return target.find(callback, thisArg);
                        }
                    case 'findIndex':
                        return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
                            const [continueOperationFindIndex, findIndexResult] = handlers.findIndex?.(target, callback, thisArg, extra) ?? [defaultMutation, undefined];
                            if (!continueOperationFindIndex) {
                                return findIndexResult;
                            }
                            return target.findIndex(callback, thisArg);
                        }
                    case 'concat':
                        return (...items: ConcatArray<T>[]) => {
                            const [continueOperationConcat, concatResult] = handlers.defaultAction?.(target, key, [items], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationConcat) {
                                return concatResult;
                            }
                            return Reflect.apply(Array.prototype.concat, target, items);
                        }
                    case 'slice':
                        return (start?: number, end?: number) => {
                            const [continueOperationSlice, sliceResult] = handlers.defaultAction?.(target, key, [start, end], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationSlice) {
                                return sliceResult;
                            }
                            return Reflect.apply(Array.prototype.slice, target, [start, end]);
                        }
                    case 'map':
                        return (callback: (value: T, index: number, array: T[]) => any, thisArg?: any) => {
                            const [continueOperationMap, mapResult] = handlers.defaultAction?.(target, key, [callback, thisArg], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationMap) {
                                return mapResult;
                            }
                            return Reflect.apply(Array.prototype.map, target, [callback, thisArg]);
                        }
                    case 'filter':
                        return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
                            const [continueOperationFilter, filterResult] = handlers.defaultAction?.(target, key, [callback, thisArg], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationFilter) {
                                return filterResult;
                            }
                            return Reflect.apply(Array.prototype.filter, target, [callback, thisArg]);
                        }
                    case 'reduce':
                        return (callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue?: any) => {
                            const [continueOperationReduce, reduceResult] = handlers.defaultAction?.(target, key, [callback, initialValue], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationReduce) {
                                return reduceResult;
                            }
                            return Reflect.apply(Array.prototype.reduce, target, [callback, initialValue]);
                        }
                    case 'reduceRight':
                        return (callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue?: any) => {
                            const [continueOperationReduceRight, reduceRightResult] = handlers.defaultAction?.(target, key, [callback, initialValue], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationReduceRight) {
                                return reduceRightResult;
                            }
                            return Reflect.apply(Array.prototype.reduceRight, target, [callback, initialValue]);
                        }
                    case 'every':
                        return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
                            const [continueOperationEvery, everyResult] = handlers.defaultAction?.(target, key, [callback, thisArg], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationEvery) {
                                return everyResult;
                            }
                            return Reflect.apply(Array.prototype.every, target, [callback, thisArg]);
                        }
                    case 'some':
                        return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
                            const [continueOperationSome, someResult] = handlers.defaultAction?.(target, key, [callback, thisArg], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationSome) {
                                return someResult;
                            }
                            return Reflect.apply(Array.prototype.some, target, [callback, thisArg]);
                        }
                    case 'forEach':
                        return (callback: (value: T, index: number, array: T[]) => void, thisArg?: any) => {
                            const [continueOperationForEach, forEachResult] = handlers.defaultAction?.(target, key, [callback, thisArg], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationForEach) {
                                return forEachResult;
                            }
                            return Reflect.apply(Array.prototype.forEach, target, [callback, thisArg]);
                        }
                    case 'flatMap':
                        return (callback: (value: T, index: number, array: T[]) => any, thisArg?: any) => {
                            const [continueOperationFlatMap, flatMapResult] = handlers.defaultAction?.(target, key, [callback, thisArg], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationFlatMap) {
                                return flatMapResult;
                            }
                            return Reflect.apply(Array.prototype.flatMap, target, [callback, thisArg]);
                        }
                    case 'flat':
                        return (depth?: number) => {
                            const [continueOperationFlat, flatResult] = handlers.defaultAction?.(target, key, [depth], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationFlat) {
                                return flatResult;
                            }
                            return Reflect.apply(Array.prototype.flat, target, [depth]);
                        }
                    case 'copyWithin':
                        return (targetIndex: number, start: number, end?: number) => {
                            const [continueOperationCopyWithin, copyWithinResult] = handlers.defaultAction?.(target, key, [targetIndex, start, end], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationCopyWithin) {
                                return copyWithinResult;
                            }
                            return Reflect.apply(Array.prototype.copyWithin, target, [targetIndex, start, end]);
                        }
                    case 'entries':
                        return () => {
                            const [continueOperationEntries, entriesResult] = handlers.defaultAction?.(target, key, [], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationEntries) {
                                return entriesResult;
                            }
                            return Reflect.apply(Array.prototype.entries, target, []);
                        }
                    case 'keys':
                        return () => {
                            const [continueOperationKeys, keysResult] = handlers.defaultAction?.(target, key, [], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationKeys) {
                                return keysResult;
                            }
                            return Reflect.apply(Array.prototype.keys, target, []);
                        }
                    case 'values':
                        return () => {
                            const [continueOperationValues, valuesResult] = handlers.defaultAction?.(target, key, [], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationValues) {
                                return valuesResult;
                            }
                            return Reflect.apply(Array.prototype.values, target, []);
                        }
                    case 'join':
                        return (separator?: string) => {
                            const [continueOperationJoin, joinResult] = handlers.defaultAction?.(target, key, [separator], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationJoin) {
                                return joinResult;
                            }
                            return Reflect.apply(Array.prototype.join, target, [separator]);
                        }
                    case 'toString':
                        return () => {
                            const [continueOperationToString, toStringResult] = handlers.defaultAction?.(target, key, [], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationToString) {
                                return toStringResult;
                            }
                            return Reflect.apply(Array.prototype.toString, target, []);
                        }
                    case 'toLocaleString':
                        return () => {
                            const [continueOperationToLocaleString, toLocaleStringResult] = handlers.defaultAction?.(target, key, [], extra) ?? [defaultMutation, undefined];
                            if (!continueOperationToLocaleString) {
                                return toLocaleStringResult;
                            }
                            return Reflect.apply(Array.prototype.toLocaleString, target, []);
                        }
                }
            }

            if (handlers.defaultAction) {
                const [continueOperationDefault, defaultResult] = handlers.defaultAction(target, key, [], extra);
                if (!continueOperationDefault) {
                    return defaultResult;
                }
            }

            return origProp;
        }
    });
}