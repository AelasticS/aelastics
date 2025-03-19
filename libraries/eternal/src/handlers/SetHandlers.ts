import { createObservableSet, SetHandlers } from "@aelastics/observables"
import { PropertyMeta } from "../meta/InternalSchema"
import { makePrivatePropertyKey, makePrivateProxyKey, makeUpdateInverseKey } from "../utils"
import { checkReadAccess, checkWriteAccess } from "../PropertyAccessors"
import { ObservableExtra } from "../types"
import { EternalStore } from "../EternalStore"

import * as invUpd from "../inverseUpdaters"

// Convert UUID to Object
const toObject = (item: any, store: EternalStore, propDes: PropertyMeta) =>
  propDes.itemType === "object" && item ? store.getObject(item) : item

// Convert object to UUID if needed
const toUUID = (value: any, propDes: PropertyMeta): any => (propDes.itemType === "object" && value ? value.uuid : value)

/** Creates handlers for observable sets */
export const createSetHandlers = <V>({ store, object, propDes }: ObservableExtra): SetHandlers<V> => {
  const privateKey = makePrivatePropertyKey(propDes.qName)
  const proxyKey = makePrivateProxyKey(propDes.qName)
  const inverseUpdaterKey = makeUpdateInverseKey(propDes.qName)
  const privateInverseKey = propDes.inverseProp ? makePrivatePropertyKey(propDes.inverseProp) : ""

  return {
    /** Ensure values stored in the set are UUIDs if applicable */
    add: (target: Set<V>, value: V) => {
      const newValue = toUUID(value, propDes)
      const obj = checkWriteAccess(object, store, propDes.qName)
      const res = obj[privateKey].add(newValue)
      if (propDes.itemType === "object" && propDes.inverseProp) {
        // set inverse of shifted item to null
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, undefined, newValue)
      }
      return [false, res]
    },

    /** Delete entry from set */
    delete: (target: Set<V>, value: V) => {
      const newValue = toUUID(value, propDes)
      const obj = checkWriteAccess(object, store, propDes.qName)
      const res = obj[privateKey].delete(newValue)
      if (propDes.itemType === "object" && propDes.inverseProp) {
        // set inverse of shifted item to null
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, newValue, undefined)
      }
      return [false, res]
    },

    /** Clear all entries from set */
    clear: (target: Set<V>) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      if (propDes.itemType === "object" && propDes.inverseProp) {
        // set inverse of cleared item to null
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        for (const value of obj[privateKey]) {
          updater(obj, value, undefined)
        }
      }
      obj[privateKey].clear()
      return [false, undefined]
    },

    /** Check if value exists */
    has: (target: Set<V>, value: V) => {
      const newValue = toUUID(value, propDes)
      const obj = checkReadAccess(object, store)
      return [false, obj[privateKey].has(newValue)]
    },

    /** Get size of set */
    size: (target: Set<V>) => {
      const obj = checkReadAccess(object, store)
      return [false, obj[privateKey].size]
    },

    /** Get values iterator */
    values: (target: Set<V>) => {
      const obj = checkReadAccess(object, store)
      const result = (function* () {
        for (const value of obj[privateKey].values()) {
          yield toObject(value, store, propDes)
        }
      })()
      return [false, result]
    },

    /** Get entries iterator */
    entries: (target: Set<V>) => {
      const obj = checkReadAccess(object, store)
      const result = (function* () {
        for (const [value] of obj[privateKey].entries()) {
          const convertedValue = toObject(value, store, propDes)
          yield [convertedValue, convertedValue] as [V, V]
        }
      })()
      return [false, result]
    },

    /** Execute function for each entry */
    forEach: (target: Set<V>, callback: (value: V, value2: V, set: Set<V>) => void, thisArg?: any) => {
      const obj = checkReadAccess(object, store)
      obj[privateKey].forEach((value: V) => {
        const newValue = toObject(value, store, propDes)
        callback.call(thisArg, newValue, newValue, target)
      })
      return [false, undefined]
    },

    /** Handle Symbol.iterator */
    [Symbol.iterator]: (target: Set<V>) => {
      const obj = checkReadAccess(object, store)
      return (function* () {
        for (const value of obj[privateKey]) {
          yield toObject(value, store, propDes)
        }
      })()
    },
  }
}

/** Helper function to create observable sets */
export function createImmutableSet<V>(set: Set<V>, observableExtra: ObservableExtra): Set<V> {
  return createObservableSet(set, createSetHandlers<V>(observableExtra))
}
