import { State } from "../State";
import { PropertyMeta } from "./MetaDefinitions";
import { isUUIDReference } from "../utils";
import { createObservableMap, createObservableSet, MapHandlers, SetHandlers } from "@aelastics/observables";

/** Creates handlers for observable maps */
export const createMapHandlers = <K, V>(
    propertyMeta: Map<string, PropertyMeta>
): MapHandlers<K, V, { key: string }> => ({
    /** Ensure values stored in the map are UUIDs if applicable */
    set: (target: Map<K, V>, key: K, value: V, extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        target.set(key, isUUIDReference(value, meta?.type) ? (value.uuid as unknown as V) : value);
        return true;
    },

    /** Delete entry from map */
    delete: (target: Map<K, V>, key: K, extra?: { key: string }) => {
        target.delete(key);
        return true;
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
        target.add(isUUIDReference(value, meta?.type) ? (value.uuid as unknown as V) : value);
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
