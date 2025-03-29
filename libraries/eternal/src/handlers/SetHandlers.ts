import { createObservableSet, SetHandlers } from "@aelastics/observables"
import { PropertyMeta } from "../meta/InternalSchema"
import { getClassName, makePrivatePropertyKey, makePrivateProxyKey, makeUpdateInverseKey, uniqueTimestamp } from "../store/utils"
import { checkReadAccess, checkWriteAccess } from "../store/PropertyAccessors"
import { ObservableExtra } from "../events/EventTypes"
import { StoreClass } from "../store/StoreClass"

import * as invUpd from "../store/inverseUpdaters"
import { EventPayload, Result } from "../events/EventTypes"
import { ChangeLogEntry } from "../events/ChangeLog"

// Convert UUID to Object
const toObject = (item: any, store: StoreClass, propDes: PropertyMeta) =>
  propDes.itemType === "object" && item ? store.getObject(item) : item

// Convert object to UUID if needed
const toUUID = (value: any, propDes: PropertyMeta): any => (propDes.itemType === "object" && value ? value.uuid : value)

/** Creates handlers for observable sets */
export const createSetHandlers = <V>({ store, object, propDes }: ObservableExtra): SetHandlers<V> => {
  const privateKey = makePrivatePropertyKey(propDes.qName)
  const proxyKey = makePrivateProxyKey(propDes.qName)
  const inverseUpdaterKey = makeUpdateInverseKey(propDes.qName)
  const privateInverseKey = propDes.inverseProp ? makePrivatePropertyKey(propDes.inverseProp) : ""
  const subscriptionManager = store.getSubscriptionManager()


  return {
    /** Ensure values stored in the set are UUIDs if applicable */
    add: (target: Set<V>, value: V) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const valueUUID = toUUID(value, propDes)

      // Check if the value already exists in the set
      if (obj[privateKey].has(valueUUID)) {
        return [false, obj[privateKey]]
      }

      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [
        {
          objectType: getClassName(object),
          objectId: object.uuid,
          operation: "update" as const,
          changeType: "add" as const,
          property: propDes.qName,
          newValue: valueUUID,
        },
      ]

      const beforeEvent: EventPayload = {
        timing: "before",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      }

      let result: Result = subscriptionManager.emit(beforeEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by before.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      // Perform the actual operation
      obj[privateKey].add(valueUUID)

      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, undefined, valueUUID)
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
        objectId: object.uuid,
        changes: changes,
      }

      result = subscriptionManager.emit(afterEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      return [false, obj[propDes.qName]]
    },

    /** Delete entry from set */
    delete: (target: Set<V>, value: V) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const valueUUID = toUUID(value, propDes)

      // Check if the value exists in the set
      if (!obj[privateKey].has(valueUUID)) {
        return [false, obj[privateKey]]
      }

      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [
        {
          objectType: getClassName(object),
          objectId: object.uuid,
          operation: "update" as const,
          changeType: "remove" as const,
          property: propDes.qName,
          oldValue: valueUUID,
        },
      ]

      const beforeEvent: EventPayload = {
        timing: "before",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      }

      let result: Result = subscriptionManager.emit(beforeEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by before.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      // Perform the actual operation
      obj[privateKey].delete(valueUUID)

      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, valueUUID, undefined)
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
        objectId: object.uuid,
        changes: changes,
      }

      result = subscriptionManager.emit(afterEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      return [false, true]
    },

    /** Clear all entries from set */
    clear: (target: Set<V>) => {
      const obj = checkWriteAccess(object, store, propDes.qName)

      // Check if the set is already empty
      if (obj[privateKey].size === 0) {
        return [false, obj[privateKey]]
      }

      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = []
      obj[privateKey].forEach((valueUUID: any) => {
        changes.push({
          objectType: getClassName(object),
          objectId: object.uuid,
          operation: "update" as const,
          changeType: "remove" as const,
          property: propDes.qName,
          oldValue: valueUUID,
        })
      })

      const beforeEvent: EventPayload = {
        timing: "before",
        operation: "update",
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
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
        objectId: object.uuid,
        changes: changes,
      }

      result = subscriptionManager.emit(afterEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      return [false, obj[privateKey]]
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
