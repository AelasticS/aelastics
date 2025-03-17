import { ArrayHandlers, createObservableArray } from "@aelastics/observables"
import { isUUIDReference, makePrivatePropertyKey, makePrivateProxyKey, makeUpdateInverseKey } from "../utils" // Import the utility function
import { checkWriteAccess, checkReadAccess } from "../PropertyAccessors"
import { EternalObject } from "./InternalTypes"
import { ObservableExtra } from "../types"
import { PropertyMeta } from "../meta/InternalSchema"
import { EternalStore } from "../EternalStore"

import * as invUpd from "../inverseUpdaters"

// Convert UUID to Object
const toObject = (item: any, store: EternalStore, propDes: PropertyMeta) =>
  propDes.itemType === "object" && item ? store.getObject(item) : item

/** Convert UUIDs to Objects */
const mapToObjects = (items: any[], store: EternalStore, propDes: PropertyMeta): any[] =>
  items.map((item) => toObject(item, store, propDes))

// Convert object to UUID if needed
const toUUID = (value: any, propDes: PropertyMeta): any => (propDes.itemType === "object" && value ? value.uuid : value)

/** Map Objects to UUIDs */
const mapToUUIDs = (items: any[], propDes: PropertyMeta): any[] =>
  propDes.itemType === "object" && items ? items.map((item) => item.uuid) : items

/** Creates typed array handlers to track UUIDs and object references */
export const createArrayHandlers = <T extends EternalObject>({
  store,
  object,
  propDes,
}: ObservableExtra): ArrayHandlers<T> => {
  const privateKey = makePrivatePropertyKey(propDes.qName)
  const proxyKey = makePrivateProxyKey(propDes.qName)
  const inverseUpdaterKey = makeUpdateInverseKey(propDes.qName)
  const privateInverseKey = propDes.inverseProp ? makePrivatePropertyKey(propDes.inverseProp) : ""

  // Return the array handlers
  return {
    // Get element by index, if it is a UUID reference, return the object
    getByIndex: (target: T[], index: number) => {
      const obj = checkReadAccess(object, store)
      const newValue = obj[privateKey][index]
      const res = toObject(newValue, store, propDes)
      return [false, res]
    },
    // Set item by index, convert object to UUID if needed
    setByIndex: (target: T[], index: number, value: any) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const newValue = toUUID(value, propDes)
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const oldValueUUID = obj[privateKey][index] 
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        // set inverse of newValue to object (connect to new value)
        // set inverse of oldValue to null (disconnect old value)
        updater(obj, oldValueUUID, newValue)
      }
      obj[privateKey][index] = newValue
      return [false, newValue]
    },
    /** Remove item from array */
    delete: (target: T[], index: number) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const deletedItem = obj[privateKey][index]; // Store the item before deleting it
      delete obj[privateKey][index]; // Delete the item
      if (propDes.itemType === "object" && propDes.inverseProp) {
        // set inverse of oldValue to null (disconnect old value)
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        updater(obj, deletedItem, undefined);
      }
      return [false, toObject(deletedItem, store, propDes)];
    },

    /** Handle push (convert objects to UUIDs if needed) */
    push: (target: T[], ...items: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName) as EternalObject;
      const items1 = mapToUUIDs(items, propDes);
      const result = obj[privateKey].push(...items1);
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of newValue to object (connect to new value)
        items.forEach((item) => {
          updater(obj, undefined, item);
        });
      }
      return [false, result];
    },

    /** Handle pop */
    pop: (target: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const item = obj[privateKey].pop();
      if (propDes.itemType === "object" && propDes.inverseProp) {
        // set inverse of popped item to null
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        updater(obj, item, undefined);
      }
      return [false, toObject(item, store, propDes)];
    },

    /** Handle shift */
    shift: (target: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const shiftedItem = obj[privateKey].shift();
      if (propDes.itemType === "object" && propDes.inverseProp) {
        // set inverse of shifted item to null
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        updater(obj, shiftedItem, undefined);
      }
      return [false, toObject(shiftedItem, store, propDes)];
    },

    /** Handle unshift (convert objects to UUIDs if needed) */
    unshift: (target: T[], ...items: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      items = mapToUUIDs(items, propDes);
      const result = obj[privateKey].unshift(...items);
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of unshift items to object (connect to new values)
        items.forEach((item) => {
          updater(obj, undefined, item);
        });
      }
      return [false, result];
    },

    /** Handle splice (convert objects to UUIDs if needed) */
    splice: (target: T[], start: number, deleteCount: number, ...items: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      items = mapToUUIDs(items, propDes);
      const deletedItems = obj[privateKey].splice(start, deleteCount, ...items);
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of deleted items to null
        deletedItems.forEach((item: any) => {
          updater(obj, item, undefined);
        });
        // set inverse of new items to object
        items.forEach((item: any) => {
          updater(obj, undefined, item);
        });
      }
      return [false, mapToObjects(deletedItems, store, propDes)];
    },

    /** Handle reverse */
    reverse: (target: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const key = makePrivatePropertyKey(propDes.qName)
      const res = obj[key].reverse()
      return [false, obj[propDes.qName]]
    },

    /** Handle sort */
    sort: (target: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const items = obj[privateKey]
      const objects = mapToObjects(items, store, propDes)
      const sortedObjects = objects.sort()

      const sortedUUIDS = mapToUUIDs(sortedObjects, propDes)
      items.splice(0, items.length, ...sortedUUIDS) // Replace the items with sorted UUIDs
      return [false, obj[propDes.qName]] // Return the proxy
    },

    /** Handle fill */
    fill: (target: T[], value: T, start: number, end: number) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const newValue = toUUID(value, propDes);
      const oldValues = obj[privateKey].slice(start, end); // Store old values before filling
    
      obj[privateKey].fill(newValue, start, end);
    
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of old values to null (disconnect old values)
        oldValues.forEach((oldValue: any) => {
          updater(obj, oldValue, undefined);
        });
        // set inverse of new values to object (connect to new values)
        for (let i = start; i < end; i++) {
          updater(obj, undefined, newValue);
        }
      }
    
      return [false, obj[propDes.qName]];
    },
    /** Handle concat */
    concat: (target: T[], ...items: T[]) => {
      const obj = checkReadAccess(object, store);
      items = mapToUUIDs(items, propDes);
      const result = obj[privateKey].concat(...items);
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of items to object (connect to new values)
        items.forEach((item) => {
          updater(obj, undefined, item);
        });
      }
      return [false, mapToObjects(result, store, propDes)];
    },

    /** Handle includes */
    includes: (target: T[], value: T) => {
      const obj = checkReadAccess(object, store)
      const newValue = toUUID(value, propDes)
      const result = obj[privateKey].includes(newValue) // check is based on UUIDs, not timestamps
      return [false, result]
    },

    /** Handle indexOf */
    indexOf: (target: T[], value: T, fromIndex: number) => {
      const obj = checkReadAccess(object, store)
      const newValue = isUUIDReference(value) ? (value.uuid as unknown as T) : value
      const result = obj[privateKey].indexOf(newValue, fromIndex)
      return [false, result]
    },

    /** Handle join */
    join: (target: T[], separator: string) => {
      const obj = checkReadAccess(object, store)
      const result = obj[privateKey].join(separator) // in case of objects, join based on UUIDs
      return [false, result]
    },

    /** Handle lastIndexOf */
    lastIndexOf: (target: T[], value: T, fromIndex: number) => {
      const obj = checkReadAccess(object, store)
      const result = obj[privateKey].lastIndexOf(value, fromIndex)
      return [false, result]
    },

    /** Handle slice */
    slice: (target: T[], start?: number, end?: number) => {
      const obj = checkReadAccess(object, store)
      const result = obj[privateKey].slice(start, end)
      return [false, mapToObjects(result, store, propDes)]
    },
    /** Handle length */
    length: (target: T[]) => {
      const obj = checkReadAccess(object, store)
      return [false, obj[privateKey].length]
    },

    /** Handle find */
    find: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.find(callback, thisArg)
      return [false, toObject(result, store, propDes)]
    },

    /** Handle findIndex */
    findIndex: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.findIndex(callback, thisArg)
      return [false, result]
    },

    /** Handle map */
    map: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.map(callback, thisArg)
      return [false, result]
    },

    /** Handle filter */
    filter: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.filter(callback, thisArg)
      return [false, result]
    },

    /** Handle reduce */
    reduce: (
      target: T[],
      callback: (accumulator: any, value: T, index: number, array: T[]) => any,
      initialValue: any
    ) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.reduce(callback, initialValue)
      return [false, result]
    },

    /** Handle reduceRight */
    reduceRight: (
      target: T[],
      callback: (accumulator: any, value: T, index: number, array: T[]) => any,
      initialValue: any
    ) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.reduceRight(callback, initialValue)
      return [false, result]
    },

    /** Handle every */
    every: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.every(callback, thisArg)
      return [false, result]
    },

    /** Handle some */
    some: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.some(callback, thisArg)
      return [false, result]
    },

    /** Handle forEach */
    forEach: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      items.forEach(callback, thisArg)
      return [false, undefined]
    },

    /** Handle flatMap */
    flatMap: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.flatMap(callback, thisArg)
      return [false, result]
    },

    /** Handle flat */
    flat: (target: T[], depth: number) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      const result = items.flat(depth)
      return [false, result]
    },

    /** Handle copyWithin */
    copyWithin: (target: T[], targetIndex: number, start: number, end: number) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const result = obj[privateKey].copyWithin(targetIndex, start, end)
      return [false, mapToObjects(result, store, propDes)]
    },

    /** Handle entries */
    entries: (target: T[]) => {
      const obj = checkReadAccess(object, store)
      const result = function* (): IterableIterator<[number, T]> {
        const size = obj[privateKey].length
        for (let i = 0; i < size; i++) {
          yield [i, toObject(obj[privateKey][i], store, propDes)]
        }
      }
      return [false, result()]
    },

    /** Handle keys */
    keys: (target: T[]) => {
      const obj = checkReadAccess(object, store)
      const result = function* (): IterableIterator<number> {
        const size = obj[privateKey].length
        for (let i = 0; i < size; i++) {
          yield i
        }
      }
      return [false, result()]
    },

    /** Handle values */
    values: (target: T[]) => {
      const obj = checkReadAccess(object, store)
      const result = function* (): IterableIterator<T> {
        const values = obj[privateKey]
        for (let i = 0; i < values.length; i++) {
          yield toObject(values[i], store, propDes)
        }
      }
      return [false, result()]
    },
    /** Handle Symbol.iterator */
    [Symbol.iterator]: (target: T[]) => {
      const obj = checkReadAccess(object, store)
      const items = mapToObjects(obj[privateKey], store, propDes)
      return (function* (): IterableIterator<T> {
        for (let i = 0; i < items.length; i++) {
          yield items[i]
        }
      })()
    },
  }
}

/** Helper function to create observable arrays */
export function createImmutableArray<T extends EternalObject>(arr: T[], extra: ObservableExtra): T[] {
  return createObservableArray(arr, createArrayHandlers<T>(extra))
}
