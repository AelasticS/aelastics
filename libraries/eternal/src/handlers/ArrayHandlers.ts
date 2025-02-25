import { ArrayHandlers, createObservableArray } from "@aelastics/observables";
import { PropertyMeta } from "./MetaDefinitions";
import { isObjectFrozen, isUUIDReference, makePrivatePropertyKey } from "../utils"; // Import the utility function
import { EternalStore } from "../EternalStore";
import { checkWriteAccess } from "../PropertyAccessors";
import { EternalClass, EternalObject } from "./InternalTypes";

/** Creates typed array handlers to track UUIDs and object references */

// TODO: observable should be also frozen when parent is frozen  

export interface ObservableExtra {
    store: EternalStore,
    object: EternalObject,
    propDes: PropertyMeta
}

export const createArrayHandlers = <T extends EternalObject>({ store, object, propDes }: ObservableExtra): ArrayHandlers<T> => ({
    // Get element by index, if it is a UUID reference, return the object
    getByIndex: (target: T[], index: number) => {
        const key = makePrivatePropertyKey(propDes.name);
        const newValue = object[key][index]
        const res = isUUIDReference(newValue) ? store.getObject(newValue.uuid) : newValue;
        return [false, res];
    },
    // Set item by index, convert object to UUID if needed
    setByIndex: (target: T[], index: number, value: T) => {
        const newValue = isUUIDReference(value) ? (value.uuid as unknown as T) : value;
        const key = makePrivatePropertyKey(propDes.name);
        target[index] = newValue;
        return [false, newValue];
    },
    /** Remove item from array */
    delete: (target: T[], index: number) => {
        const deletedItem = Reflect.deleteProperty(target, index)  
        return [false, deletedItem];
    },

    /** Handle push (convert objects to UUIDs if needed) */
    push: (target: T[], items: T[]) => {
        const obj = checkWriteAccess(object, store, propDes.name);
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const key = makePrivatePropertyKey(propDes.name);
        const result = obj[key].push(...items);
        return [false, result];
    },

    /** Handle pop */
    pop: (target: T[]) => {
        const poppedItem = target.pop();
        return [false, poppedItem];
    },

    /** Handle shift */
    shift: (target: T[]) => {
        const shiftedItem = target.shift();
        return [false, shiftedItem];
    },

    /** Handle unshift (convert objects to UUIDs if needed) */
    unshift: (target: T[], items: T[]) => {
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const result = target.unshift(...items);
        return [false, result];
    },

    /** Handle splice (convert objects to UUIDs if needed) */
    splice: (target: T[], start: number, deleteCount: number, items: T[]) => {
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const deletedItems = target.splice(start, deleteCount, ...items);
        return [false, deletedItems];
    },

    /** Handle reverse */
    reverse: (target: T[]) => {
        target.reverse();
        return [false, target];
    },

    /** Handle sort */
    sort: (target: T[]) => {
        target.sort();
        return [false, target];
    },

    /** Handle fill */
    fill: (target: T[], value: T, start: number, end: number) => {
        const newValue = isUUIDReference(value) ? (value.uuid as unknown as T) : value;
        target.fill(newValue, start, end);
        return [false, target];
    },
    /** Handle concat */
    concat: (target: T[], items: T[]) => {
        items = items.map((item) => (isUUIDReference(item) ? (item.uuid as unknown as T) : item));
        const result = target.concat(items);
        return [true, result];
    },

    /** Handle includes */
    includes: (target: T[], value: T) => {
        const result = target.includes(value);
        return [true, result];
    },

    /** Handle indexOf */
    indexOf: (target: T[], value: T, fromIndex: number) => {
        const result = target.indexOf(value, fromIndex);
        return [true, result];
    },

    /** Handle join */
    join: (target: T[], separator: string) => {
        const result = target.join(separator);
        return [true, result];
    },

    /** Handle lastIndexOf */
    lastIndexOf: (target: T[], value: T, fromIndex: number) => {
        const result = target.lastIndexOf(value, fromIndex);
        return [true, result];
    },

    /** Handle slice */
    slice: (target: T[], start?: number, end?: number) => {
        const result = target.slice(start, end);
        return [true, result];
    },
    /** Handle length */
    length: (target: T[], length: number) => {
        target.length = length;
        return [true, length];
    },

    /** Handle size */
    size: (target: T[], size: number) => {
        target.length = size;
        return [true, size];
    },

    /** Handle find */
    find: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
        const result = target.find(callback, thisArg);
        return [true, result];
    },

    /** Handle findIndex */
    findIndex: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
        const result = target.findIndex(callback, thisArg);
        return [true, result];
    },

    /** Handle map */
    map: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
        const result = target.map(callback, thisArg);
        return [true, result];
    },

    /** Handle filter */
    filter: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
        const result = target.filter(callback, thisArg);
        return [true, result];
    },

    /** Handle reduce */
    reduce: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any) => {
        const result = target.reduce(callback, initialValue);
        return [true, result];
    },

    /** Handle reduceRight */
    reduceRight: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any) => {
        const result = target.reduceRight(callback, initialValue);
        return [true, result];
    },

    /** Handle every */
    every: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
        const result = target.every(callback, thisArg);
        return [true, result];
    },

    /** Handle some */
    some: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
        const result = target.some(callback, thisArg);
        return [true, result];
    },

    /** Handle forEach */
    forEach: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any) => {
        target.forEach(callback, thisArg);
        return [true, undefined];
    },

    /** Handle flatMap */
    flatMap: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
        const result = target.flatMap(callback, thisArg);
        return [true, result];
    },

    /** Handle flat */
    flat: (target: T[], depth: number) => {
        const result = target.flat(depth);
        return [true, result];
    },

    /** Handle copyWithin */
    copyWithin: (target: T[], targetIndex: number, start: number, end: number) => {
        const result = target.copyWithin(targetIndex, start, end);
        return [true, result];
    },

    /** Handle entries */
    entries: (target: T[]) => {
        const result = target.entries();
        return [true, result];
    },

    /** Handle keys */
    keys: (target: T[]) => {
        const result = target.keys();
        return [true, result];
    },

    /** Handle values */
    values: (target: T[]) => {
        const result = target.values();
        return [true, result];
    },
    /** Default action */
    defaultAction: (target: T[], key: PropertyKey, args?: any[]) => {
        console.warn(`Unhandled array method: ${String(key)}`);
        return [true, undefined];
    },

});


/** Helper function to create observable arrays */
export function createObservableEntityArray<T extends EternalObject>(arr: T[], extra: ObservableExtra): T[] {
    return createObservableArray(arr, createArrayHandlers<T>(extra));
}