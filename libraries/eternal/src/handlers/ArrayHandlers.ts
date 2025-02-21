import { ArrayHandlers, createObservableArray } from "@aelastics/observables";
import { PropertyMeta } from "./MetaDefinitions";
import { isUUIDReference } from "../utils"; // Import the utility function

/** Creates typed array handlers to track UUIDs and object references */

// TODO: observable should be also frozen when parent is frozen  

export interface ObservableExtra {
    frozen: boolean
}

export const createArrayHandlers = <T>(extra:ObservableExtra): ArrayHandlers<T, ObservableExtra> => ({
    /** Ensure object references are stored as UUIDs if applicable */
    set: (target: T[], index: number, value: T, extra: ObservableExtra) => {
        const newValue = isUUIDReference(value) ? (value.uuid as unknown as T) : value;
        target[index] = newValue;
        return [false, newValue];
    },

    /** Remove item from array */
    delete: (target: T[], index: number, extra?: ObservableExtra) => {
        const deletedItem = Reflect.deleteProperty(target, index)  // target.splice(index, 1)[0];
        return [false, deletedItem];
    },

    /** Handle push (convert objects to UUIDs if needed) */
    push: (target: T[], items: T[], extra?: ObservableExtra) => {
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const result = target.push(...items);
        return [false, result];
    },

    /** Handle pop */
    pop: (target: T[], extra?: ObservableExtra) => {
        const poppedItem = target.pop();
        return [false, poppedItem];
    },

    /** Handle shift */
    shift: (target: T[], extra?: ObservableExtra) => {
        const shiftedItem = target.shift();
        return [false, shiftedItem];
    },

    /** Handle unshift (convert objects to UUIDs if needed) */
    unshift: (target: T[], items: T[], extra?: ObservableExtra) => {
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const result = target.unshift(...items);
        return [false, result];
    },

    /** Handle splice (convert objects to UUIDs if needed) */
    splice: (target: T[], start: number, deleteCount: number, items: T[], extra?: ObservableExtra) => {
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const deletedItems = target.splice(start, deleteCount, ...items);
        return [false, deletedItems];
    },

    /** Handle reverse */
    reverse: (target: T[], extra?: ObservableExtra) => {
        target.reverse();
        return [false, target];
    },

    /** Handle sort */
    sort: (target: T[], extra?: ObservableExtra) => {
        target.sort();
        return [false, target];
    },

    /** Handle fill */
    fill: (target: T[], value: T, start: number, end: number, extra?: ObservableExtra) => {
        const newValue = isUUIDReference(value) ? (value.uuid as unknown as T) : value;
        target.fill(newValue, start, end);
        return [false, target];
    },
    /** Handle concat */
    concat: (target: T[], items: T[], extra?: ObservableExtra) => {
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const result = target.concat(items);
        return [true, result];
    },

    /** Handle includes */
    includes: (target: T[], value: T, extra?: ObservableExtra) => {
        const result = target.includes(value);
        return [true, result];
    },

    /** Handle indexOf */
    indexOf: (target: T[], value: T, fromIndex: number, extra?: ObservableExtra) => {
        const result = target.indexOf(value, fromIndex);
        return [true, result];
    },

    /** Handle join */
    join: (target: T[], separator: string, extra?: ObservableExtra) => {
        const result = target.join(separator);
        return [true, result];
    },

    /** Handle lastIndexOf */
    lastIndexOf: (target: T[], value: T, fromIndex: number, extra?: ObservableExtra) => {
        const result = target.lastIndexOf(value, fromIndex);
        return [true, result];
    },

    /** Handle slice */
    slice: (target: T[], start?: number, end?: number, extra?: ObservableExtra) => {
        const result = target.slice(start, end);
        return [true, result];
    },
    /** Handle length */
    length: (target: T[], length: number, extra?: ObservableExtra) => {
        target.length = length;
        return [true, length];
    },

    /** Handle size */
    size: (target: T[], size: number, extra?: ObservableExtra) => {
        target.length = size;
        return [true, size];
    },

    /** Handle find */
    find: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: ObservableExtra) => {
        const result = target.find(callback, thisArg);
        return [true, result];
    },

    /** Handle findIndex */
    findIndex: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: ObservableExtra) => {
        const result = target.findIndex(callback, thisArg);
        return [true, result];
    },

    /** Handle map */
    map: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any, extra?: ObservableExtra) => {
        const result = target.map(callback, thisArg);
        return [true, result];
    },

    /** Handle filter */
    filter: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: ObservableExtra) => {
        const result = target.filter(callback, thisArg);
        return [true, result];
    },

    /** Handle reduce */
    reduce: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any, extra?: ObservableExtra) => {
        const result = target.reduce(callback, initialValue);
        return [true, result];
    },

    /** Handle reduceRight */
    reduceRight: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any, extra?: ObservableExtra) => {
        const result = target.reduceRight(callback, initialValue);
        return [true, result];
    },

    /** Handle every */
    every: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: ObservableExtra) => {
        const result = target.every(callback, thisArg);
        return [true, result];
    },

    /** Handle some */
    some: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: ObservableExtra) => {
        const result = target.some(callback, thisArg);
        return [true, result];
    },

    /** Handle forEach */
    forEach: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any, extra?: ObservableExtra) => {
        target.forEach(callback, thisArg);
        return [true, undefined];
    },

    /** Handle flatMap */
    flatMap: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any, extra?: ObservableExtra) => {
        const result = target.flatMap(callback, thisArg);
        return [true, result];
    },

    /** Handle flat */
    flat: (target: T[], depth: number, extra?: ObservableExtra) => {
        const result = target.flat(depth);
        return [true, result];
    },

    /** Handle copyWithin */
    copyWithin: (target: T[], targetIndex: number, start: number, end: number, extra?: ObservableExtra) => {
        const result = target.copyWithin(targetIndex, start, end);
        return [true, result];
    },

    /** Handle entries */
    entries: (target: T[], extra?: ObservableExtra) => {
        const result = target.entries();
        return [true, result];
    },

    /** Handle keys */
    keys: (target: T[], extra?: ObservableExtra) => {
        const result = target.keys();
        return [true, result];
    },

    /** Handle values */
    values: (target: T[], extra?: ObservableExtra) => {
        const result = target.values();
        return [true, result];
    },
    /** Default action */
    defaultAction: (target: T[], key: PropertyKey, args?: any[], extra?: ObservableExtra) => {
        console.warn(`Unhandled array method: ${String(key)}`);
        return [true, undefined];
    },

});


/** Helper function to create observable arrays */
export function createObservableEntityArray<T>(arr: T[], allowMutations: boolean, 
    extra: ObservableExtra): T[] {
    return createObservableArray(arr, createArrayHandlers<T>(extra));
}