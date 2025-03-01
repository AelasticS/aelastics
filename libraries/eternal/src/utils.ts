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

import { EternalStore } from "./EternalStore";
import { EternalObject } from "./handlers/InternalTypes";
import { PropertyMeta } from "./handlers/MetaDefinitions";


export const isObjectFrozen = (obj: EternalObject)=>{
    return obj.state !== undefined
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


/**
 * Removes an element from an array using splice.
 */
export function removeElement<T>(array: T[], valueToRemove: T): void {
    const index = array.indexOf(valueToRemove);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

export function makePrivatePropertyKey(propertyName: string) {
   // return Symbol.for(propertyName);
   return `_${propertyName}`;
}

export function makeUpdateInverseKey(key: string): string {
    return `_updateInverse_${key}`;
}

export function makePrivateProxyKey(propertyName: string) {
    // return Symbol.for(propertyName);
    return `_proxy_${propertyName}`;
 }
/** Convert to Object or Return Value */
export function toObject(item: any, store: EternalStore, propDes: PropertyMeta): any {
    return (propDes.type === 'object') ? store.getObject(item) : item;
}
/** Map UUIDs to Objects */
//TODO find type of array elements
export function mapToObjects(items: any[], store: EternalStore, propDes: PropertyMeta): any[] {
    return (propDes.type === 'object') ? items.map((item) => store.getObject(item.uuid)) : items;
}
/** Convert Object to UUID */
export function toUUID(value: any, propDes: PropertyMeta): any {
    return (propDes.type === 'object') ? value.uuid : value;
}
/** Map Objects to UUIDs */
export function mapToUUIDs(items: any[], propDes: any): any[] {
    return (propDes.type === 'object') ? items.map((item) => item.uuid) : items;
}
