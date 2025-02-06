import { ArrayHandlers, createObservableArray } from "@aelastics/observables";
import { State } from "../State";
import { PropertyMeta } from "./MetaDefinitions";
import { isUUIDReference } from "../utils"; // Import the utility function

/** Creates typed array handlers to track UUIDs and object references */
export const createArrayHandlers = <T>(
    state: State,
    propertyMeta: Map<string, PropertyMeta>
): ArrayHandlers<T, { key: string }> => ({
    /** Ensure object references are stored as UUIDs if applicable */
    set: (target: T[], index: number, value: T, extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        target[index] = isUUIDReference(value, meta?.type) ? (value.uuid as unknown as T) : value;
        return true;
    },

    /** Remove item from array */
    delete: (target: T[], index: number, extra?: { key: string }) => {
        target.splice(index, 1);
        return true;
    },

    /** Handle push (convert objects to UUIDs if needed) */
    push: (target: T[], items: T[], extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        if (meta?.type === "object") {
            items = items.map((item) => (isUUIDReference(item, meta.type) ? (item.uuid as unknown as T) : item));
        }
        target.push(...items);
        return true;
    },

    /** Handle pop */
    pop: (target: T[], extra?: { key: string }) => {
        target.pop();
        return true;
    },

    /** Handle shift */
    shift: (target: T[], extra?: { key: string }) => {
        target.shift();
        return true;
    },

    /** Handle unshift (convert objects to UUIDs if needed) */
    unshift: (target: T[], items: T[], extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        if (meta?.type === "object") {
            items = items.map((item) => (isUUIDReference(item, meta.type) ? (item.uuid as unknown as T) : item));
        }
        target.unshift(...items);
        return true;
    },

    /** Handle splice (convert objects to UUIDs if needed) */
    splice: (target: T[], start: number, deleteCount: number, items: T[], extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        if (meta?.type === "object") {
            items = items.map((item) => (isUUIDReference(item, meta.type) ? (item.uuid as unknown as T) : item));
        }
        target.splice(start, deleteCount, ...items);
        return true;
    },

    /** Handle reverse */
    reverse: (target: T[], extra?: { key: string }) => {
        target.reverse();
        return true;
    },

    /** Handle sort */
    sort: (target: T[], extra?: { key: string }) => {
        target.sort();
        return true;
    },

    /** Handle fill */
    fill: (target: T[], value: T, start: number, end: number, extra?: { key: string }) => {
        const meta = propertyMeta.get(extra?.key || "");
        target.fill(isUUIDReference(value, meta?.type) ? (value.uuid as unknown as T) : value, start, end);
        return true;
    },

    /** Default action */
    defaultAction: (target: T[], key: PropertyKey, args?: any[], extra?: { key: string }) => {
        console.warn(`Unhandled array method: ${String(key)}`);
        return true;
    }
});

/** Helper function to create observable arrays */
export function createObservableEntityArray<T>(
    arr: T[],
    state: State,
    propertyMeta: Map<string, PropertyMeta>
): T[] {
    return createObservableArray(arr, createArrayHandlers<T>(state, propertyMeta));
}
