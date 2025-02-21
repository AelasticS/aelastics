import { ArrayHandlers, createObservableArray } from "@aelastics/observables";
import { State } from "../State";
import { PropertyMeta } from "./MetaDefinitions";
import { isUUIDReference } from "../utils"; // Import the utility function

/** Creates typed array handlers to track UUIDs and object references */
export const createArrayHandlers = <T>(
    propertyMeta: Map<string, PropertyMeta>
): ArrayHandlers<T, { key: string }> => ({
    /** Ensure object references are stored as UUIDs if applicable */
    set: (target: T[], index: number, value: T, extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        const newValue = isUUIDReference(value, meta?.type) ? (value.uuid as unknown as T) : value;
        target[index] = newValue;
        return [false, newValue];
    },

    /** Remove item from array */
    delete: (target: T[], index: number, extra?: { key: string }) => {
        const deletedItem = Reflect.deleteProperty(target, index)  // target.splice(index, 1)[0];
        return [false, deletedItem];
    },

    /** Handle push (convert objects to UUIDs if needed) */
    push: (target: T[], items: T[], extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        if (meta?.type === "object") {
            items = items.map((item) => (isUUIDReference(item, meta.type) ? (item.uuid as unknown as T) : item));
        }
        const result = target.push(...items);
        return [false, result];
    },

    /** Handle pop */
    pop: (target: T[], extra?: { key: string }) => {
        const poppedItem = target.pop();
        return [false, poppedItem];
    },

    /** Handle shift */
    shift: (target: T[], extra?: { key: string }) => {
        const shiftedItem = target.shift();
        return [false, shiftedItem];
    },

    /** Handle unshift (convert objects to UUIDs if needed) */
    unshift: (target: T[], items: T[], extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        if (meta?.type === "object") {
            items = items.map((item) => (isUUIDReference(item, meta.type) ? (item.uuid as unknown as T) : item));
        }
        const result = target.unshift(...items);
        return [false, result];
    },

    /** Handle splice (convert objects to UUIDs if needed) */
    splice: (target: T[], start: number, deleteCount: number, items: T[], extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        if (meta?.type === "object") {
            items = items.map((item) => (isUUIDReference(item, meta.type) ? (item.uuid as unknown as T) : item));
        }
        const deletedItems = target.splice(start, deleteCount, ...items);
        return [false, deletedItems];
    },

    /** Handle reverse */
    reverse: (target: T[], extra?: { key: string }) => {
        target.reverse();
        return [false, target];
    },

    /** Handle sort */
    sort: (target: T[], extra?: { key: string }) => {
        target.sort();
        return [false, target];
    },

    /** Handle fill */
    fill: (target: T[], value: T, start: number, end: number, extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        const newValue = isUUIDReference(value, meta?.type) ? (value.uuid as unknown as T) : value;
        target.fill(newValue, start, end);
        return [false, target];
    },
    /** Handle concat */
    concat: (target: T[], items: T[], extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        if (meta?.type === "object") {
            items = items.map((item) => (isUUIDReference(item, meta.type) ? (item.uuid as unknown as T) : item));
        }
        const result = target.concat(items);
        return [true, result];
    },

    /** Handle includes */
    includes: (target: T[], value: T, extra?: { key: string }) => {
        const result = target.includes(value);
        return [true, result];
    },

    /** Handle indexOf */
    indexOf: (target: T[], value: T, fromIndex: number, extra?: { key: string }) => {
        const result = target.indexOf(value, fromIndex);
        return [true, result];
    },

    /** Handle join */
    join: (target: T[], separator: string, extra?: { key: string }) => {
        const result = target.join(separator);
        return [true, result];
    },

    /** Handle lastIndexOf */
    lastIndexOf: (target: T[], value: T, fromIndex: number, extra?: { key: string }) => {
        const result = target.lastIndexOf(value, fromIndex);
        return [true, result];
    },

    /** Handle slice */
    slice: (target: T[], start?: number, end?: number, extra?: { key: string }) => {
        const result = target.slice(start, end);
        return [true, result];
    },
    /** Handle length */
    length: (target: T[], length: number, extra?: { key: string }) => {
        target.length = length;
        return [true, length];
    },

    /** Handle size */
    size: (target: T[], size: number, extra?: { key: string }) => {
        target.length = size;
        return [true, size];
    },

    /** Handle find */
    find: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: { key: string }) => {
        const result = target.find(callback, thisArg);
        return [true, result];
    },

    /** Handle findIndex */
    findIndex: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: { key: string }) => {
        const result = target.findIndex(callback, thisArg);
        return [true, result];
    },

    /** Handle map */
    map: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any, extra?: { key: string }) => {
        const result = target.map(callback, thisArg);
        return [true, result];
    },

    /** Handle filter */
    filter: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: { key: string }) => {
        const result = target.filter(callback, thisArg);
        return [true, result];
    },

    /** Handle reduce */
    reduce: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any, extra?: { key: string }) => {
        const result = target.reduce(callback, initialValue);
        return [true, result];
    },

    /** Handle reduceRight */
    reduceRight: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any, extra?: { key: string }) => {
        const result = target.reduceRight(callback, initialValue);
        return [true, result];
    },

    /** Handle every */
    every: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: { key: string }) => {
        const result = target.every(callback, thisArg);
        return [true, result];
    },

    /** Handle some */
    some: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any, extra?: { key: string }) => {
        const result = target.some(callback, thisArg);
        return [true, result];
    },

    /** Handle forEach */
    forEach: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any, extra?: { key: string }) => {
        target.forEach(callback, thisArg);
        return [true, undefined];
    },

    /** Handle flatMap */
    flatMap: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any, extra?: { key: string }) => {
        const result = target.flatMap(callback, thisArg);
        return [true, result];
    },

    /** Handle flat */
    flat: (target: T[], depth: number, extra?: { key: string }) => {
        const result = target.flat(depth);
        return [true, result];
    },

    /** Handle copyWithin */
    copyWithin: (target: T[], targetIndex: number, start: number, end: number, extra?: { key: string }) => {
        const result = target.copyWithin(targetIndex, start, end);
        return [true, result];
    },

    /** Handle entries */
    entries: (target: T[], extra?: { key: string }) => {
        const result = target.entries();
        return [true, result];
    },

    /** Handle keys */
    keys: (target: T[], extra?: { key: string }) => {
        const result = target.keys();
        return [true, result];
    },

    /** Handle values */
    values: (target: T[], extra?: { key: string }) => {
        const result = target.values();
        return [true, result];
    },
    /** Default action */
    defaultAction: (target: T[], key: PropertyKey, args?: any[], extra?: { key: string }) => {
        console.warn(`Unhandled array method: ${String(key)}`);
        return [true, undefined];
    },

});

/** Helper function to create observable arrays */
export function createObservableEntityArray<T>(
    arr: T[],
    propertyMeta: Map<string, PropertyMeta>
): T[] {
    return createObservableArray(arr, createArrayHandlers<T>(propertyMeta));
}