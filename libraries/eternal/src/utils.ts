export function generateUUID(): string {
    return crypto.randomUUID();
}

/** Utility function to check if a value is an object with a UUID */
export function isUUIDReference(value: any): value is { uuid: string } {
    return (
        value !== null &&
        typeof value === "object" &&
        "uuid" in value &&
        typeof value.uuid === "string"
    );
}

/**
 * Copies properties from the source object to the target object, including properties from the prototype chain.
 */
export function copyProperties(target: any, source: any) {
    // Copy own properties
    Object.getOwnPropertyNames(source).forEach((key) => {
        target[key] = source[key];
    });

    // Get the prototype of the source object
    const proto = Object.getPrototypeOf(source);

    // If the prototype is not null, recursively copy properties from the prototype
    if (proto !== null) {
        copyProperties(target, proto);
    }
}

import { createObservableEntityArray } from "./handlers/ArrayHandlers";
import { EternalObject } from "./handlers/InternalTypes";


// Shallow copy an object with observables, skipping getters and setters
export function shallowCopyWithObservables<T extends EternalObject>(obj: T): T {

    // Create an empty object with the same prototype as the original object
    const copy = Object.create(Object.getPrototypeOf(obj));
    let currentObj: any = obj;
    while (currentObj !== null) {
        for (const key of Object.getOwnPropertyNames(currentObj)) {
            if (!copy.hasOwnProperty(key)) {
                const descriptor = Object.getOwnPropertyDescriptor(currentObj, key);
                if (descriptor && (descriptor.get || descriptor.set)) {
                    // Skip getters and setters
                    continue;
                }

                let value = currentObj[key];

                if (Array.isArray(value)) {
                    const oldArray = value;
                    value = createObservableEntityArray([...oldArray], true, {frozen: false});
                    // Create a new observable array
                    // TODO  copy of observables of arrays and maps and set as well

                    // copy[key] = createObservableEntityArray(value, propertyMeta);
                } else {
                    // Shallow copy other properties
                    copy[key] = value;
                }
            }
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }

    return copy as T;
}

// Generate a unique timestamp
export function uniqueTimestamp() {
    var date = Date.now();

    // If created at same millisecond as previous
    if (date <= uniqueTimestamp.previous) {
        date = ++uniqueTimestamp.previous;
    } else {
        uniqueTimestamp.previous = date;
    }

    return date;
}
// Initialize the previous timestamp
uniqueTimestamp.previous = 0;