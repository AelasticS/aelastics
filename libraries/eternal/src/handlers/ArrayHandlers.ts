import { ArrayHandlers, createObservableArray } from "@aelastics/observables";
import { isUUIDReference, makePrivatePropertyKey, mapToObjects, mapToUUIDs, toObject, toUUID } from "../utils"; // Import the utility function
import { checkWriteAccess, checkReadAccess } from "../PropertyAccessors";
import { EternalObject } from "./InternalTypes";
import { ObservableExtra } from "../types";

/** Creates typed array handlers to track UUIDs and object references */
export const createArrayHandlers = <T extends EternalObject>({ store, object, propDes }: ObservableExtra): ArrayHandlers<T> => {
    // Return the array handlers
    return {
        // Get element by index, if it is a UUID reference, return the object
        getByIndex: (target: T[], index: number) => {
            const key = makePrivatePropertyKey(propDes.qName);
            const obj = checkReadAccess(object, store);
            const newValue = obj[key][index]
            const res = toObject(newValue, store, propDes)
            return [false, res];
        },
        // Set item by index, convert object to UUID if needed
        setByIndex: (target: T[], index: number, value: any) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const newValue = toUUID(value, propDes);
            const key = makePrivatePropertyKey(propDes.qName);
            obj[key][index] = newValue;
            return [false, newValue];
        },
        /** Remove item from array */
        delete: (target: T[], index: number) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const deletedItem = delete obj[key][index]// Reflect.deleteProperty(obj, index)
            return [false, deletedItem];
        },

        /** Handle push (convert objects to UUIDs if needed) */
        push: (target: T[], items: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const items1 = mapToUUIDs(items, propDes);
            const result = obj[key].push(...items1);
            return [false, result];
        },

        /** Handle pop */
        pop: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const item = obj[key].pop();
            return [false, toObject(item, store, propDes)];
        },

        /** Handle shift */
        shift: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const shiftedItem = obj[key].shift();
            return [false, toObject(shiftedItem, store, propDes)];
        },

        /** Handle unshift (convert objects to UUIDs if needed) */
        unshift: (target: T[], items: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            items = mapToUUIDs(items, propDes);
            const result = obj[key].unshift(...items);
            return [false, result];
        },

        /** Handle splice (convert objects to UUIDs if needed) */
        splice: (target: T[], start: number, deleteCount: number, items: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            items = mapToUUIDs(items, propDes);
            const deletedItems = obj[key].splice(start, deleteCount, ...items);
            return [false, mapToObjects(deletedItems, store, propDes)];
        },

        /** Handle reverse */
        reverse: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const res = obj[key].reverse();
            return [false, obj[propDes.qName]];
        },

        /** Handle sort */
        sort: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = obj[key];
            const objects = mapToObjects(items, store, propDes);
            const sortedObjects = objects.sort();

            const sortedUUIDS = mapToUUIDs(sortedObjects, propDes);
            items.splice(0, items.length, ...sortedUUIDS); // Replace the items with sorted UUIDs
            return [false, obj[propDes.qName]]; // Return the proxy 
        },

        /** Handle fill */
        fill: (target: T[], value: T, start: number, end: number) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const newValue = toUUID(value, propDes);
            obj[key].fill(newValue, start, end);
            return [false, obj[propDes.qName]];
        },
        /** Handle concat */
        concat: (target: T[], items: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            items = mapToUUIDs(items, propDes);
            const result = obj[key].concat(...items);
            return [false, mapToObjects(result, store, propDes)];
        },

        /** Handle includes */
        includes: (target: T[], value: T) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const newValue = toUUID(value, propDes);
            const result = obj[key].includes(newValue);  // check is based on UUIDs, not timestamps
            return [false, result];
        },

        /** Handle indexOf */
        indexOf: (target: T[], value: T, fromIndex: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const newValue = isUUIDReference(value) ? (value.uuid as unknown as T) : value;
            const result = obj[key].indexOf(newValue, fromIndex);
            return [false, result];
        },

        /** Handle join */
        join: (target: T[], separator: string) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const result = obj[key].join(separator);  // in case of objects, join based on UUIDs
            return [false, result];
        },

        /** Handle lastIndexOf */
        lastIndexOf: (target: T[], value: T, fromIndex: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const result = obj[key].lastIndexOf(value, fromIndex);
            return [false, result];
        },

        /** Handle slice */
        slice: (target: T[], start?: number, end?: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const result = obj[key].slice(start, end);
            return [false, mapToObjects(result, store, propDes)];
        },
        /** Handle length */
        length: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            return [false, obj[key].length];
        },

        /** Handle find */
        find: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.find(callback, thisArg)
            return [false, toObject(result, store, propDes)];
        },

        /** Handle findIndex */
        findIndex: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.findIndex(callback, thisArg);
            return [false, result];
        },

        /** Handle map */
        map: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.map(callback, thisArg);
            return [false, result];
        },

        /** Handle filter */
        filter: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.filter(callback, thisArg);
            return [false, result];
        },

        /** Handle reduce */
        reduce: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.reduce(callback, initialValue);
            return [false, result];
        },

        /** Handle reduceRight */
        reduceRight: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.reduceRight(callback, initialValue);
            return [false, result];
        },

        /** Handle every */
        every: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.every(callback, thisArg);
            return [false, result];
        },

        /** Handle some */
        some: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.some(callback, thisArg);
            return [false, result];
        },

        /** Handle forEach */
        forEach: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            items.forEach(callback, thisArg);
            return [false, undefined];
        },

        /** Handle flatMap */
        flatMap: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.flatMap(callback, thisArg);
            return [false, result];
        },

        /** Handle flat */
        flat: (target: T[], depth: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            const result = items.flat(depth);
            return [false, result];
        },

        /** Handle copyWithin */
        copyWithin: (target: T[], targetIndex: number, start: number, end: number) => {
            const obj = checkWriteAccess(object, store, propDes.qName);
            const key = makePrivatePropertyKey(propDes.qName);
            const result = obj[key].copyWithin(targetIndex, start, end);
            return [false, mapToObjects(result, store, propDes)];
        },

        /** Handle entries */
        entries: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const result = function* (): IterableIterator<[number, T]> {
                const size = obj[key].length;
                for (let i = 0; i < size; i++) {
                    yield [i, toObject(obj[key][i], store, propDes)];
                }
            };
            return [false, result()];
        },

        /** Handle keys */
        keys: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const result = function* (): IterableIterator<number> {
                const size = obj[key].length;
                for (let i = 0; i < size; i++) {
                    yield i;
                }
            };
            return [false, result()];
        },

        /** Handle values */
        values: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const result = function* (): IterableIterator<T> {
                const values = obj[key];
                for (let i = 0; i < values.length; i++) {
                    yield toObject(values[i], store, propDes);
                }
            };
            return [false, result()];
        },
        /** Handle Symbol.iterator */
        [Symbol.iterator]: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.qName);
            const items = mapToObjects(obj[key], store, propDes);
            return function* (): IterableIterator<T> {
                for (let i = 0; i < items.length; i++) {
                    yield items[i];
                }
            }();
        },
    }
};


/** Helper function to create observable arrays */
export function createObservableEntityArray<T extends EternalObject>(arr: T[], extra: ObservableExtra): T[] {
    return createObservableArray(arr, createArrayHandlers<T>(extra));
}