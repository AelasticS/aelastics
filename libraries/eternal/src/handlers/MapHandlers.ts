import { getClassName, makePrivatePropertyKey, makeUpdateInverseKey, uniqueTimestamp } from "../store/utils"
import { createObservableMap, MapHandlers } from "@aelastics/observables"
import { ObservableExtra } from "../events/EventTypes"
import { checkReadAccess, checkWriteAccess } from "../store/PropertyAccessors"
import { StoreClass } from "../store/StoreClass"
import { PropertyMeta } from "../meta/InternalSchema"

import * as invUpd from "../store/inverseUpdaters"
import { ChangeLogEntry } from "../events/ChangeLog"
import { EventPayload, Result } from "../events/EventTypes"
import { uuid } from "../store/InternalTypes"

// Convert value UUID to Object
const toValueObject = (item: any, store: StoreClass, propDes: PropertyMeta) =>
  propDes.itemType === "object" && item ? store.findObjectByUUID(item) : item

// Convert key UUID to Object
const toKeyObject = (item: any, store: StoreClass, propDes: PropertyMeta) =>
  propDes.keyType === "object" && item ? store.findObjectByUUID(item) : item

// Convert value object to UUID if needed
const valueToUUID = (value: any, propDes: PropertyMeta): any =>
  propDes.itemType === "object" && value ? value[uuid] : value

// Convert key object to UUID if needed
const keyToUUID = (value: any, propDes: PropertyMeta): any =>
  propDes.keyType === "object" && value ? value[uuid] : value

export const createImmutableMapHandlers = <K, V>({ store, object, propDes }: ObservableExtra): MapHandlers<K, V> => {
  const privateKey = makePrivatePropertyKey(propDes.qName)
  const inverseUpdaterKey = propDes.inverseProp ? makeUpdateInverseKey(propDes.qName) : ""
  const subscriptionManager = store.subscriptionManager

  return {
    /** Ensure values stored in the map are UUIDs if applicable */
    set: (target: Map<K, V>, key: K, value: V) => {
      const newValue = valueToUUID(value, propDes)
      const newKey = keyToUUID(key, propDes)
      const obj = checkWriteAccess(object, store, propDes.qName)

      // get the old value
      const oldValue = obj[privateKey].get(newKey)
      // If the old value is the same as the new value, do not update
      if (oldValue === newValue && obj[privateKey].has(newKey)) {
        return [false, obj[privateKey]]
      }
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = []
      if(obj[privateKey].has(newKey)) {
      changes.push({
        objectType: getClassName(object),
        objectId: object[uuid],
        operation: "update" as const,
        changeType: "remove" as const,
        property: propDes.qName,
        oldValue: oldValue,
        key: newKey,
      })}
      changes.push({
        objectType: getClassName(object),
        objectId: object[uuid],
        operation: "update" as const,
        changeType: "add" as const,
        property: propDes.qName,
        newValue: newValue,
        key: newKey,
      })
      const beforeEvent: EventPayload = {
        timing: "before",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object[uuid],
        changes: changes,
      }

      let result: Result = subscriptionManager.emit(beforeEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by before.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      // Perform the actual operation
      const res = obj[privateKey].set(newKey, newValue)

      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, oldValue, newValue)
      }

      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes)

      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: "after",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object[uuid],
        changes: changes,
      }

      result = subscriptionManager.emit(afterEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      return [false, res]
    },

    /** Get value by key */
    get: (target: Map<K, V>, key: K) => {
      const obj = checkReadAccess(object, store)
      const newKey = keyToUUID(key, propDes)
      const newValue = obj[privateKey].get(newKey)
      const res = toValueObject(newValue, store, propDes)
      return [false, res]
    },

    /** Check if key exists */
    has: (target: Map<K, V>, key: K) => {
      const obj = checkReadAccess(object, store)
      const keyUUID = keyToUUID(key, propDes)
      return [false, obj[privateKey].has(keyUUID)]
    },

    /** Delete entry from map */
    delete: (target: Map<K, V>, key: K) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const keyUUID = keyToUUID(key, propDes)
      const oldValue = obj[privateKey].get(keyUUID)

      // Check if the key exists in the map
      if (!obj[privateKey].has(keyUUID)) {
        return [false, false]
      }

      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [
        {
          objectType: getClassName(object),
          objectId: object[uuid],
          operation: "update" as const,
          changeType: "remove" as const,
          property: propDes.qName,
          oldValue: oldValue,
          key: keyUUID,
        },
      ]

      const beforeEvent: EventPayload = {
        timing: "before",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object[uuid],
        changes: changes,
      }

      let result: Result = subscriptionManager.emit(beforeEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by before.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      // Perform the actual operation
      const res = obj[privateKey].delete(keyUUID)

      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, oldValue, undefined)
      }

      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes)

      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: "after",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object[uuid],
        changes: changes,
      }

      result = subscriptionManager.emit(afterEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      return [false, res]
    },

    /** Clear all entries from map */
    clear: (target: Map<K, V>) => {
      const obj = checkWriteAccess(object, store, propDes.qName)

      // Check if the map is already empty
      if (obj[privateKey].size === 0) {
        return [false, undefined]
      }

      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = []
      obj[privateKey].forEach((valueUUID: any, keyUUID: any) => {
        changes.push({
          objectType: getClassName(object),
          objectId: object[uuid],
          operation: "update" as const,
          changeType: "remove" as const,
          property: propDes.qName,
          oldValue: valueUUID,
          key: keyUUID,
        })
      })

      const beforeEvent: EventPayload = {
        timing: "before",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object[uuid],
        changes: changes,
      }

      let result: Result = subscriptionManager.emit(beforeEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by before.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      // Perform the actual operation
      obj[privateKey].clear()

      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        changes.forEach((change) => {
          updater(obj, change.oldValue, undefined)
        })
      }

      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes)

      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: "after",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object[uuid],
        changes: changes,
      }

      result = subscriptionManager.emit(afterEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      return [false, undefined]
    },

    /** Get size of map */
    size: (target: Map<K, V>) => {
      const privateKey = makePrivatePropertyKey(propDes.qName)
      const obj = checkReadAccess(object, store)
      const res = obj[privateKey].size
      return [false, res]
    },

    /** Get keys iterator */
    keys: (target: Map<K, V>) => {
      const obj = checkReadAccess(object, store)

      const key = makePrivatePropertyKey(propDes.qName)
      const result = Array.from(obj[key].keys())
        .map((k) => toKeyObject(k, store, propDes))
        [Symbol.iterator]()
      return [false, result]
    },

    /** Get values iterator */
    values: (target: Map<K, V>) => {
      const obj = checkReadAccess(object, store)
      const result = (function* () {
        for (const value of obj[privateKey].values()) {
          yield toValueObject(value, store, propDes)
        }
      })()
      return [false, result]
    },

    /** Get entries iterator */
    entries: (target: Map<K, V>) => {
      const obj = checkReadAccess(object, store)
      const result = (function* (): IterableIterator<[K, V]> {
        for (const [key, value] of obj[privateKey].entries()) {
          yield [toKeyObject(key, store, propDes), toValueObject(value, store, propDes)]
        }
      })()
      return [false, result]
    },

    /** Execute function for each entry */
    forEach: (target: Map<K, V>, callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) => {
      const obj = checkReadAccess(object, store)
      const result = obj[privateKey].forEach((value: V, key: K, map: Map<K, V>) => {
        const newKey = toKeyObject(key, store, propDes)
        const newValue = toValueObject(value, store, propDes)
        callback.call(thisArg, newValue, newKey, map)
      })
      return [false, result]
    },

    /** Handle Symbol.iterator */
    [Symbol.iterator]: (target: Map<K, V>) => {
      const obj = checkReadAccess(object, store)
      const key = makePrivatePropertyKey(propDes.qName)
      return (function* generator() {
        for (const [k, v] of obj[key]) {
          yield [toKeyObject(k, store, propDes), toValueObject(v, store, propDes)] as [K, V]
        }
      })()
    },
  }
}

/** Helper function to create observable maps */
export function createImmutableMap<K, V>(map: Map<K, V>, observableExtra: ObservableExtra): Map<K, V> {
  return createObservableMap(map, createImmutableMapHandlers<K, V>(observableExtra))
}
