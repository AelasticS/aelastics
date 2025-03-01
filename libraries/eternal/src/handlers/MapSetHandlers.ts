import { PropertyMeta } from "./MetaDefinitions";
import { isUUIDReference, makePrivatePropertyKey, toObject } from "../utils";
import { createObservableMap, createObservableSet, MapHandlers, SetHandlers } from "@aelastics/observables";
import { ObservableExtra } from "../types";
import { checkReadAccess } from "../PropertyAccessors";

export const createMapHandlers = <K, V>({ store, object, propDes }: ObservableExtra
): MapHandlers<K, V> => ({
    /** Ensure values stored in the map are UUIDs if applicable */
    set: (target: Map<K, V>, key: K, value: V, extra?: { key: string }) => {
                    const key = makePrivatePropertyKey(propDes.qName);
                    const obj = checkReadAccess(object, store);
                    const newValue = obj[key][index]
                    const res = toObject(newValue, store, propDes)
                    return [false, res];
        target.set(key, isUUIDReference(value) ? (value.uuid as unknown as V) : value);
        return true;
    },

    /** Get value by key */
    get: (target: Map<K, V>, key: K, extra?: { key: string }) => {
        const value = target.get(key);
        return isUUIDReference(value) ? store.getObject(value.uuid) : value;
    },

    /** Check if key exists */
    has: (target: Map<K, V>, key: K, extra?: { key: string }) => {
        return [false, target.has(key)];
    },

    /** Delete entry from map */
    delete: (target: Map<K, V>, key: K, extra?: { key: string }) => {
        target.delete(key);
        return true;
    },

    /** Clear all entries from map */
    clear: (target: Map<K, V>, extra?: { key: string }) => {
        target.clear();
        return true;
    },

    /** Get size of map */
    size: (target: Map<K, V>, extra?: { key: string }) => {
        return target.size;
    },

    /** Get keys iterator */
    keys: (target: Map<K, V>, extra?: { key: string }) => {
        return target.keys();
    },

    /** Get values iterator */
    values: (target: Map<K, V>, extra?: { key: string }) => {
        return target.values();
    },

    /** Get entries iterator */
    entries: (target: Map<K, V>, extra?: { key: string }) => {
        return target.entries();
    },

    /** Execute function for each entry */
    forEach: (target: Map<K, V>, callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any, extra?: { key: string }) => {
        target.forEach(callback, thisArg);
        return true;
    },

    /** Handle Symbol.iterator */
    [Symbol.iterator]: (target: Map<K, V>, extra?: { key: string }) => {
        return target[Symbol.iterator]();
    },

    /** Default action */
    defaultAction: (target: Map<K, V>, key: PropertyKey, args?: any[], extra?: { key: string }) => {
        console.warn(`Unhandled map method: ${String(key)}`);
        return true;
    }
});

/** Creates handlers for observable sets */
export const createSetHandlers = <V>(
    propertyMeta: Map<string, PropertyMeta>
): SetHandlers<V, { key: string }> => ({
    /** Ensure values stored in the set are UUIDs if applicable */
    add: (target: Set<V>, value: V, extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        target.add(isUUIDReference(value) ? (value.uuid as unknown as V) : value);
        return true;
    },

    /** Delete entry from set */
    delete: (target: Set<V>, value: V, extra?: { key: string }) => {
        target.delete(value);
        return true;
    },

    /** Default action */
    defaultAction: (target: Set<V>, key: PropertyKey, args?: any[], extra?: { key: string }) => {
        console.warn(`Unhandled set method: ${String(key)}`);
        return true;
    }
});

/** Helper function to create observable maps */
export function createObservableEntityMap<K, V>(
    map: Map<K, V>,
    propertyMeta: Map<string, PropertyMeta>
): Map<K, V> {
    return createObservableMap(map, createMapHandlers<K, V>(propertyMeta));
}

/** Helper function to create observable sets */
export function createObservableEntitySet<V>(
    set: Set<V>,
    propertyMeta: Map<string, PropertyMeta>
): Set<V> {
    return createObservableSet(set, createSetHandlers<V>(propertyMeta));
}
