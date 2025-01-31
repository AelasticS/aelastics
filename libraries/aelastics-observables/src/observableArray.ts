export interface ArrayHandlers<T, P extends {} = {}> {
    set?: (target: T[], index: number, value: T, extra?: P) => boolean;
    delete?: (target: T[], index: number, extra?: P) => boolean;
    push?: (target: T[], items: T[], extra?: P) => boolean;
    pop?: (target: T[], extra?: P) => boolean;
    shift?: (target: T[], extra?: P) => boolean;
    unshift?: (target: T[], items: T[], extra?: P) => boolean;
    splice?: (target: T[], start: number, deleteCount: number, items: T[], extra?: P) => boolean;
    reverse?: (target: T[], extra?: P) => boolean;
    sort?: (target: T[], extra?: P) => boolean;
    fill?: (target: T[], value: T, start: number, end: number, extra?: P) => boolean;
    defaultAction?: (target: T[], key: PropertyKey, args?: any[], extra?: P) => boolean;
}

export function createObservableArray<T, P extends {} = {}>(
    arr: T[],
    handlers: ArrayHandlers<T, P>,
    defaultMutation: boolean = true,
    extra?: P
): T[] {
    return new Proxy(arr, {
        set(target: T[], key: string | number | symbol, value: any, receiver: any): boolean {
            if (typeof key === 'number' || !isNaN(Number(key))) {
                const index = Number(key);
                if (handlers.set) {
                    const allowMutation = handlers.set(target, index, value, extra);
                    if (allowMutation) {
                        Reflect.set(target, index, value, receiver);
                    }
                } else if (defaultMutation) {
                    Reflect.set(target, index, value, receiver);
                }
            } else if (handlers.defaultAction) {
                const allowDefault = handlers.defaultAction(target, key, [], extra);
                if (!allowDefault) {
                    return true;
                }
            }
            return true;
        },

        deleteProperty(target: T[], key: string | number | symbol): boolean {
            if (typeof key === 'number' || !isNaN(Number(key))) {
                const index = Number(key);
                if (handlers.delete) {
                    const allowMutation = handlers.delete(target, index, extra);
                    if (allowMutation || defaultMutation) {
                        Reflect.deleteProperty(target, index);
                    }
                } else if (defaultMutation) {
                    Reflect.deleteProperty(target, index);
                }
            } else if (handlers.defaultAction) {
                const allowDefault = handlers.defaultAction(target, key, [], extra);
                if (!allowDefault) {
                    return false;
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
                            const allowPush = handlers.push?.(target, items, extra) ?? defaultMutation;
                            return allowPush ? Reflect.apply(Array.prototype.push, target, items) : target.length;
                        };
                    case 'pop':
                        return () => {
                            const allowPop = handlers.pop?.(target, extra) ?? defaultMutation;
                            return allowPop ? Reflect.apply(Array.prototype.pop, target, []) : undefined;
                        };
                    case 'shift':
                        return () => {
                            const allowShift = handlers.shift?.(target, extra) ?? defaultMutation;
                            return allowShift ? Reflect.apply(Array.prototype.shift, target, []) : undefined;
                        };
                    case 'unshift':
                        return (...items: T[]) => {
                            const allowUnshift = handlers.unshift?.(target, items, extra) ?? defaultMutation;
                            return allowUnshift ? Reflect.apply(Array.prototype.unshift, target, items) : target.length;
                        };
                    case 'splice':
                        return (start: number, deleteCount: number, ...items: T[]) => {
                            const allowSplice = handlers.splice?.(target, start, deleteCount, items, extra) ?? defaultMutation;
                            return allowSplice ? Reflect.apply(Array.prototype.splice, target, [start, deleteCount, ...items]) : [];
                        };
                    case 'reverse':
                        return () => {
                            const allowReverse = handlers.reverse?.(target, extra) ?? defaultMutation;
                            return allowReverse ? Reflect.apply(Array.prototype.reverse, target, []) : target;
                        };
                    case 'sort':
                        return (compareFn?: (a: T, b: T) => number) => {
                            const allowSort = handlers.sort?.(target, extra) ?? defaultMutation;
                            return allowSort ? Reflect.apply(Array.prototype.sort, target, [compareFn]) : target;
                        };
                    case 'fill':
                        return (value: T, start: number = 0, end?: number) => {
                            const allowFill = handlers.fill?.(target, value, start, end ?? target.length, extra) ?? defaultMutation;
                            return allowFill ? Reflect.apply(Array.prototype.fill, target, [value, start, end]) : target;
                        };
                }
            }

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
