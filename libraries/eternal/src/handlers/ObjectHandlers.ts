import { ObjectHandlers, createObservableObject } from "@aelastics/observables";
import { State } from "../State";
import { PropertyMeta } from "./MetaDefinitions";
import { isUUIDReference } from "../utils"; // Import the utility function
import { InternalObjectProps } from "./InternalTypes";
import { EternalStore } from "../EternalStore";

/** Creates typed object handlers to track UUID references and enforce immutability */
export const createObjectHandlers = <T extends object>(
    state: State,
    propertyMeta: Map<string, PropertyMeta>
): ObjectHandlers<T, { key: string }> => ({
    /** Set property, converting object references to UUIDs if applicable */
    set: (target: T, key: string | number | symbol, value: any, extra?: { key: string }) => {
        const meta = propertyMeta.get(key.toString());

        // Convert object reference to UUID if necessary
        (target as any)[key] = isUUIDReference(value, meta?.type) ? value.uuid : value;

        return true;
    },

    /** Delete property */
    delete: (target: T, key: string | number | symbol, extra?: { key: string }) => {
        delete (target as any)[key];
        return true;
    },

    /** Intercept method calls (if needed for transformation) */
    method: (target: T, key: string | number | symbol, args: any[], extra?: { key: string }) => {
        console.warn(`Method intercepted: ${String(key)} with args`, args);
        return true;
    },

    /** Default action if no specific handler exists */
    defaultAction: (target: T, key: PropertyKey, extra?: { key: string }) => {
        console.warn(`Unhandled object property access: ${String(key)}`);
        return true;
    }
});

/** Helper function to create observable objects */
export function createObservableEntity<T extends object>(
    obj: T,
    state: State,
    propertyMeta: Map<string, PropertyMeta>
): T {
    return createObservableObject(obj, createObjectHandlers<T>(state, propertyMeta));
}

export function createVersionedProxy<T extends InternalObjectProps>(store: EternalStore, uuid: string): T {
    return new Proxy({} as T, {
        get(target, prop, receiver) {
            const latestObject = store.getState().getObject<T>(uuid);
            if (!latestObject) {
                throw new Error(`Object ${uuid} not found in current state`);
            }
            return Reflect.get(latestObject, prop, receiver);
        },
        set(target, prop, value) {
            throw new Error(`Cannot modify object properties directly. Use produce() instead.`);
        }
    });
}