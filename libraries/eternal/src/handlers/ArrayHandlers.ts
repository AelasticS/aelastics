import { ArrayHandlers, createObservableArray } from "@aelastics/observables";
import { PropertyMeta } from "./MetaDefinitions";
import { isUUIDReference, makePrivatePropertyKey } from "../utils"; // Import the utility function
import { EternalStore } from "../EternalStore";
import { checkWriteAccess, checkReadAccess } from "../PropertyAccessors";
import { EternalObject } from "./InternalTypes";

/** Creates typed array handlers to track UUIDs and object references */

// TODO: observable should be also frozen when parent is frozen  

export interface ObservableExtra {
    store: EternalStore,
    object: EternalObject,
    propDes: PropertyMeta
}


export const createArrayHandlers = <T extends EternalObject>({ store, object, propDes }: ObservableExtra): ArrayHandlers<T> => {
    // Helper functions
    /** Convert to Object or Return Value */
    function toObject(item: any): T {
        return (propDes.type === 'object') ? store.getObject(item) : item;
    }
    /** Map UUIDs to Objects */
    //TODO find type of array elements
    function mapToObjects(items: any[]): T[] {
        return (propDes.type === 'object') ? items.map((item) => store.getObject(item.uuid)) : items;
    }
    /** Convert Object to UUID */
    function toUUID(value: any): T {
        return (propDes.type === 'object') ? value.uuid : value;
    }
    /** Map Objects to UUIDs */
    function mapToUUIDs(items: any[]): T[] {
        return (propDes.type === 'object') ? items.map((item) => item.uuid) : items;
    }

    // Return the array handlers
    return {
        // Get element by index, if it is a UUID reference, return the object
        getByIndex: (target: T[], index: number) => {
            const key = makePrivatePropertyKey(propDes.name);
            const obj = checkReadAccess(object, store);
            const newValue = obj[key][index]
            const res = toObject(newValue);
            return [false, res];
        },
        // Set item by index, convert object to UUID if needed
        setByIndex: (target: T[], index: number, value: any) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const newValue = toUUID(value);
            const key = makePrivatePropertyKey(propDes.name);
            obj[key][index] = newValue;
            return [false, newValue];
        },
        /** Remove item from array */
        delete: (target: T[], index: number) => {
            const key = makePrivatePropertyKey(propDes.name);
            const deletedItem = Reflect.deleteProperty(target, index)
            return [false, deletedItem];
        },

        /** Handle push (convert objects to UUIDs if needed) */
        push: (target: T[], items: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            const items1 = mapToUUIDs(items);
            const result = obj[key].push(...items1);
            return [false, result];
        },

        /** Handle pop */
        pop: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            const item = obj[key].pop();
            return [false, toObject(item)];
        },

        /** Handle shift */
        shift: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            const shiftedItem = obj[key].shift();
            return [false, toObject(shiftedItem)];
        },

        /** Handle unshift (convert objects to UUIDs if needed) */
        unshift: (target: T[], items: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            items = mapToUUIDs(items);
            const result = obj[key].unshift(...items);
            return [false, result];
        },

        /** Handle splice (convert objects to UUIDs if needed) */
        splice: (target: T[], start: number, deleteCount: number, items: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            items = mapToUUIDs(items);
            const deletedItems = obj[key].splice(start, deleteCount, ...items);
            return [false, mapToObjects(deletedItems)];
        },

        /** Handle reverse */
        reverse: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            const res = obj[key].reverse();
            return [false, obj[propDes.name]];
        },

        /** Handle sort */
        sort: (target: T[]) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            const items = obj[key];
            const objects = mapToObjects(items);
            const sortedObjects = objects.sort();

            const sortedUUIDS = mapToUUIDs(sortedObjects);
            items.splice(0, items.length, ...sortedUUIDS); // Replace the items with sorted UUIDs
            return [false, obj[propDes.name]]; // Return the proxy 
        },

        /** Handle fill */
        fill: (target: T[], value: T, start: number, end: number) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            const newValue = toUUID(value);
            obj[key].fill(newValue, start, end);
            return [false, obj[propDes.name]];
        },
        /** Handle concat */
        concat: (target: T[], items: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            items = mapToUUIDs(items);
            const result = obj[key].concat(...items);
            return [false, mapToObjects(result)];
        },

        /** Handle includes */
        includes: (target: T[], value: T) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const newValue = toUUID(value);
            const result = obj[key].includes(newValue);  // check is based on UUIDs, not timestamps
            return [false, result];
        },

        /** Handle indexOf */
        indexOf: (target: T[], value: T, fromIndex: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const newValue = isUUIDReference(value) ? (value.uuid as unknown as T) : value;
            const result = obj[key].indexOf(newValue, fromIndex);
            return [false, result];
        },

        /** Handle join */
        join: (target: T[], separator: string) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const result = obj[key].join(separator);  // in case of objects, join based on UUIDs
            return [false, result];
        },

        /** Handle lastIndexOf */
        lastIndexOf: (target: T[], value: T, fromIndex: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const result = obj[key].lastIndexOf(value, fromIndex);
            return [false, result];
        },

        /** Handle slice */
        slice: (target: T[], start?: number, end?: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const result = obj[key].slice(start, end);
            return [false, mapToObjects(result)];
        },
        /** Handle length */
        length: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            return [false, obj[key].length];
        },

        /** Handle find */
        find: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.find(callback, thisArg)
            return [false, toObject(result)];
        },

        /** Handle findIndex */
        findIndex: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.findIndex(callback, thisArg);
            return [false, result];
        },

        /** Handle map */
        map: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.map(callback, thisArg);
            return [false, result];
        },

        /** Handle filter */
        filter: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.filter(callback, thisArg);
            return [false, result];
        },

        /** Handle reduce */
        reduce: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.reduce(callback, initialValue);
            return [false, result];
        },

        /** Handle reduceRight */
        reduceRight: (target: T[], callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.reduceRight(callback, initialValue);
            return [false, result];
        },

        /** Handle every */
        every: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.every(callback, thisArg);
            return [false, result];
        },

        /** Handle some */
        some: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.some(callback, thisArg);
            return [false, result];
        },

        /** Handle forEach */
        forEach: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            items.forEach(callback, thisArg);
            return [false, undefined];
        },

        /** Handle flatMap */
        flatMap: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.flatMap(callback, thisArg);
            return [false, result];
        },

        /** Handle flat */
        flat: (target: T[], depth: number) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const items = mapToObjects(obj[key]);
            const result = items.flat(depth);
            return [false, result];
        },

        /** Handle copyWithin */
        copyWithin: (target: T[], targetIndex: number, start: number, end: number) => {
            const obj = checkWriteAccess(object, store, propDes.name);
            const key = makePrivatePropertyKey(propDes.name);
            const result = obj[key].copyWithin(targetIndex, start, end);
            return [false, mapToObjects(result)];
        },

        /** Handle entries */
        entries: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const result = function* (): IterableIterator<[number, T]> {
                for (let [index, value] of obj[key].entries()) {
                    yield [index, toObject(value)];
                }
            };
            return [false, result()];
        },

        /** Handle keys */
        keys: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const result = function* (): IterableIterator<number> {
                for (let index of obj[key].keys()) {
                    yield index;
                }
            };
            return [false, result()];
        },

        /** Handle values */
        values: (target: T[]) => {
            const obj = checkReadAccess(object, store);
            const key = makePrivatePropertyKey(propDes.name);
            const result = function* (): IterableIterator<T> {
                for (let value of obj[key].values()) {
                    yield toObject(value);
                }
            };
            return [false, result()];
        },
        /** Handle Symbol.iterator */
        // [Symbol.iterator]: (target: T[]) => {
        //     const obj = checkReadAccess(object, store);
        //     const key = makePrivatePropertyKey(propDes.name);
        //     const items = mapToObjects(obj[key]);
        //     return function* (): IterableIterator<T> {
        //         for (let item of items) {
        //             yield item;
        //         }
        //     }();
        // },

        /** Default action */
        defaultAction: (target: T[], key: PropertyKey, args?: any[]) => {
            console.warn(`Unhandled array method: ${String(key)}`);
            return [true, undefined];
        },

    }
};


/** Helper function to create observable arrays */
export function createObservableEntityArray<T extends EternalObject>(arr: T[], extra: ObservableExtra): T[] {
    return createObservableArray(arr, createArrayHandlers<T>(extra));
}

