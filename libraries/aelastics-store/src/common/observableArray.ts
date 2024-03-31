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

interface IArrayHandlers<T> {
    set?: (target: T[], index: number, value: T) => boolean;
    delete?: (target: T[], index: number) => boolean;
    push?: (target: T[], items: T[]) => boolean;
    pop?: (target: T[]) => boolean;
    shift?: (target: T[]) => boolean;
    unshift?: (target: T[], items: T[]) => boolean;
    splice?: (target: T[], start: number, deleteCount: number, items: T[]) => boolean;
    reverse?: (target: T[]) => boolean;
    sort?: (target: T[]) => boolean;
    fill?: (target: T[], value: T, start: number, end: number) => boolean;
    defaultAction?: (target: T[], key: PropertyKey, args?: any[]) => boolean;
}

export function createObservableArray<T>(
  arr: T[], 
  handlers: IArrayHandlers<T>,
  defaultMutation: boolean = true
): T[] {
    return new Proxy(arr, {
        set(target: T[], key: PropertyKey, value: T) {
            const allowMutation = handlers.set ? handlers.set(target, Number(key), value) : defaultMutation;
            if (key !== 'length' && allowMutation) {
                target[key as any] = value;
            }
            return true;
        },
        deleteProperty(target: T[], key: PropertyKey): boolean {
            const allowMutation = handlers.delete ? handlers.delete(target, Number(key)) : defaultMutation;
            if (allowMutation) {
                delete target[key as any];
            }
            return true;
        },
        get(target: T[], key: PropertyKey) {
            switch (key) {
                case 'push':
                    return function(...args: T[]): number {
                        const allowMutation = handlers.push ? handlers.push(target, args) : defaultMutation;
                        return allowMutation ? Array.prototype.push.apply(target, args) : target.length;
                    };
                case 'pop':
                    return function(): T | undefined {
                        const allowMutation = handlers.pop ? handlers.pop(target) : defaultMutation;
                        return allowMutation ? Array.prototype.pop.apply(target) : undefined;
                    };
                case 'shift':
                    return function(): T | undefined {
                        const allowMutation = handlers.shift ? handlers.shift(target) : defaultMutation;
                        return allowMutation ? Array.prototype.shift.apply(target) : undefined;
                    };
                case 'unshift':
                    return function(...args: T[]): number {
                        const allowMutation = handlers.unshift ? handlers.unshift(target, args) : defaultMutation;
                        return allowMutation ? Array.prototype.unshift.apply(target, args) : target.length;
                    };
                case 'splice':
                    return function(start: number, deleteCount: number=0, ...items: T[]): T[] {
                        const allowMutation = handlers.splice 
                            ? handlers.splice(target, start, deleteCount || 0, items) 
                            : defaultMutation;
                        return allowMutation ? Array.prototype.splice.apply(target, [start, deleteCount, ...items]) : [];
                    };
                case 'reverse':
                    return function(): T[] {
                        const allowMutation = handlers.reverse ? handlers.reverse(target) : defaultMutation;
                        return allowMutation ? Array.prototype.reverse.apply(target) : [...target];
                    };
                case 'sort':
                    return function(compareFn?: (a: T, b: T) => number): T[] {
                        const allowMutation = handlers.sort ? handlers.sort(target) : defaultMutation;
                        return allowMutation ? Array.prototype.sort.apply(target, [compareFn]) : [...target].sort(compareFn);
                    };
                case 'fill':
                    return function(value: T, start?: number, end?: number): T[] {
                        const allowMutation = handlers.fill ? handlers.fill(target, value, start || 0, end || target.length) : defaultMutation;
                        return allowMutation ? Array.prototype.fill.apply(target, [value, start, end]) : [...target];
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


