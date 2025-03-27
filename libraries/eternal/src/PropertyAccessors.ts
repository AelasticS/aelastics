import { isCollectionOfReferences, isReference, PropertyMeta, TypeMeta } from "./meta/InternalSchema"
import { EternalStore } from "./EternalStore"
import { EternalClass, EternalObject } from "./handlers/InternalTypes"
import {
  isObjectFrozen,
  makeDisconnectKey,
  makePrivatePropertyKey,
  makePrivateProxyKey,
  makeUpdateInverseKey,
} from "./utils"

import * as invUpd from "./inverseUpdaters"
import { EventPayload, Result } from "./events/EventTypes"
import { ChangeLogEntry } from "./events/ChangeLog"

// check access and return correct version of object

export function checkReadAccess(obj: EternalObject, store: EternalStore): EternalObject {
  const state = store.getState()
  const isFrozen = isObjectFrozen(obj)
  const isInUpdateMode = store.isInUpdateMode()

  if (isInUpdateMode) {
    if (obj.nextVersion) {
      const nextVersion = obj.nextVersion.deref()
      if (!isFrozen && state.isCreatedInState(nextVersion)) {
        return nextVersion
      }
      if (!isFrozen) {
        throw new Error(
          `Invalid reference to object ${obj.constructor.name}: ${obj.uuid} from a past state.\n` +
            `Use 'store.getObject(uuid)' to retrieve the current version of the object, or 'store.getFromState(stateIndex, uuid)' to access it from an old state.`
        )
      }
    }
    return obj
  }
  if (!isFrozen && obj.nextVersion && !state.isMemberOfState(obj)) {
    throw new Error(
      `Invalid reference to object ${obj.constructor.name}: ${obj.uuid} from a past state.\n` +
        `Use 'store.getObject(uuid)' to retrieve the current version of the object, or 'store.getFromState(stateIndex, uuid)' to access it from an old state.`
    )
  }
  return obj
}

export function checkWriteAccess(obj: EternalObject, store: EternalStore, key: string): EternalObject {
  // if not allowed update throw error
  if (isObjectFrozen(obj)) {
    throw new Error(`Cannot modify property "${key}" of the frozen object"`)
  }
  // if not in update mode throw error
  if (!store.isInUpdateMode()) {
    throw new Error(`Cannot modify the object outside of update mode`)
  }

  // if obj is from old state
  if (store.getState().isFromOlderState(obj)) {
    if (!obj.nextVersion) {
      // has no new version, create and return new version
      return store.getState().createNewVersion(obj)
    } else {
      // has new version, return new version
      const nextVersion = obj.nextVersion.deref()
      // return only if new version belongs to the current state
      if (store.getState().isCreatedInState(nextVersion)) {
        return nextVersion
      } else {
        throw new Error(`Illegal reference to an object not from the current state.`)
      }
    }
  }
  // obj is from current state
  return obj
}

/** Adds optimized property accessors to a dynamically generated class prototype */
export function addPropertyAccessors(prototype: any, typeMeta: TypeMeta, store: EternalStore) {
  const subscriptionManager = store.getSubscriptionManager()

  if (!subscriptionManager) {
    throw new Error("Subscription manager not found.")
  }


  // Check if typeMeta.properties is defined and is a Map
  if (!typeMeta.properties || !(typeMeta.properties instanceof Map)) {
    throw new Error(`Invalid properties for typeMeta: ${typeMeta.qName}`)
  }

  for (const [key, propertyMeta] of typeMeta.properties) {
    const privateKey = makePrivatePropertyKey(key)
    const proxyKey = makePrivateProxyKey(key)
    const inverseUpdaterKey = makeUpdateInverseKey(key)
    const privateInverseKey = propertyMeta.inverseProp ? makePrivatePropertyKey(propertyMeta.inverseProp) : ""

    if (!propertyMeta) {
      throw new Error(`Property metadata for key "${key}" is undefined in typeMeta: ${typeMeta.qName}`)
    }

    // Generate optimized getter
    let getter: (this: EternalObject) => any
    if (propertyMeta.type === "object") {
      getter = function (this: EternalObject) {
        let obj = checkReadAccess(this, store)
        return store.getObject(obj[privateKey]) // Directly resolve UUIDs
      }
    } else {
      getter = function (this: any) {
        let obj = checkReadAccess(this, store)
        return obj[privateKey] // Directly return stored value
      }
    }

    // Generate optimized setter
    let setter: (this: EternalObject, value: any) => void

    // TODO add to changelog

    if (propertyMeta.type === "array" || propertyMeta.type === "set" || propertyMeta.type === "map") {
      getter = function () {
        let obj = checkReadAccess(this, store)
        return obj[proxyKey] // Use proxy for collection properties
      }
      // Prevent direct assignment to collection properties
      setter = function () {
        // TODO in future: create proxy, disconnect old and connect new elements
        throw new Error(`Cannot directly assign to collection property "${key}" of an object"`)
      }
    } else if (propertyMeta.type === "object") {
      setter = function (this: EternalObject, value: EternalObject | undefined) {
        // Validate that the value is an object, undefined, or null, but not an array or any other special object
        if (value !== null && value !== undefined && (typeof value !== "object" || Array.isArray(value))) {
          throw new Error(`Invalid value for property "${key}". Expected an object, null, or undefined.`);
        }
        // Prevent redundant updates
        if (this[privateKey] === value?.uuid && store.isInUpdateMode()) {
          return
        }

        // Emit before.update event and check for cancellation
        const oldUUID = this[privateKey]
        const newUUID = value?.uuid
        const changes: ChangeLogEntry[] = [
          {
            objectId: this.uuid,
            operation: "update" as const,
            changeType: "update" as const,
            property: key,
            oldValue: oldUUID,
            newValue: newUUID,
          },
        ]

        const beforeEvent: EventPayload = {
          eventType: `before.update.${typeMeta.qName}.${propertyMeta.qName}.update`,
          timestamp: new Date(),
          objectId: this.uuid,
          changes: changes,
        }

        let result: Result = subscriptionManager.emit(beforeEvent)
        if (!result.success) {
          throw new Error(
            `Transaction cancelled by before.update event: ${result.errors.map((e) => e.message).join(", ")}`
          )
        }

        // Perform the actual change
        const obj = checkWriteAccess(this, store, key)
        obj[privateKey] = newUUID

        // Ensure bidirectional relationships are updated correctly
        if (propertyMeta.domainType && propertyMeta.inverseProp && (oldUUID || value)) {
          const updater: invUpd.inverseUpdater | undefined = obj[inverseUpdaterKey]
          if (!updater) {
            throw new Error(`Inverse updater function for property "${key}" is undefined.`)
          }
          updater(obj, oldUUID, value)
        }

        // Track the change
        const state = store.getState()
        if (!state) {
          throw new Error("State not found.")
        }
        state.trackChange(changes)

        // Emit after.update event and check for cancellation
        const afterEvent: EventPayload = {
          eventType: `after.update.${typeMeta.qName}.${propertyMeta.qName}.update`,
          timestamp: new Date(),
          objectId: this.uuid,
          changes: changes,
        }

        result = subscriptionManager.emit(afterEvent)
        if (!result.success) {
          throw new Error(
            `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
          )
        }
      }
    } else {
      // primitive type
      setter = function (this: EternalObject, value: any) {
        // Validate that the value has the correct primitive type
        const expectedType = propertyMeta.type
        const actualType = typeof value

        if (
          value !== null &&
          value !== undefined &&
          ((expectedType === "string" && actualType !== "string") ||
            (expectedType === "number" && actualType !== "number") ||
            (expectedType === "boolean" && actualType !== "boolean"))
        ) {
          throw new Error(
            `Invalid value for property "${key}". Expected type "${expectedType}", but received type "${actualType}".`
          )
        }

        // Prevent redundant updates
        if (this[privateKey] === value && store.isInUpdateMode()) {
          return
        }

        // Emit before.update event and check for cancellation
        const oldValue = this[privateKey]
        const changes: ChangeLogEntry[] = [
          {
            objectId: this.uuid,
            operation: "update" as const,
            changeType: "update" as const,
            property: key,
            oldValue: oldValue,
            newValue: value,
          },
        ]

        const beforeEvent: EventPayload = {
          eventType: `before.update.${typeMeta.qName}.${propertyMeta.qName}.update`,
          timestamp: new Date(),
          objectId: this.uuid,
          changes: changes,
        }

        let result: Result = subscriptionManager.emit(beforeEvent)
        if (!result.success) {
          throw new Error(
            `Transaction cancelled by before.update event: ${result.errors.map((e) => e.message).join(", ")}`
          )
        }

        // Perform the actual change
        const obj = checkWriteAccess(this, store, key)
        obj[privateKey] = value

        // Track the change
        const state = store.getState()
        if (!state) {
          throw new Error("State not found.")
        }
        state.trackChange(changes)

        // Emit after.update event and check for cancellation
        const afterEvent: EventPayload = {
          eventType: `after.update.${typeMeta.qName}.${propertyMeta.qName}.update`,
          timestamp: new Date(),
          objectId: this.uuid,
          changes: changes,
        }

        result = subscriptionManager.emit(afterEvent)
        if (!result.success) {
          throw new Error(
            `Transaction cancelled by after.update event: ${result.errors.map((e) => e.message).join(", ")}`
          )
        }
      }
    }
    // Define property on prototype
    Object.defineProperty(prototype, key, { get: getter, set: setter })

    // Precompute and bind inverse relationship updater

    if (propertyMeta.domainType && propertyMeta.inverseProp) {
      switch (propertyMeta.type) {
        // property is an object
        case "object":
          switch (propertyMeta.inverseType) {
            case "object":
              prototype[inverseUpdaterKey] = invUpd.one2one(store, propertyMeta)
              break
            case "array":
              prototype[inverseUpdaterKey] = invUpd.one2array(store, propertyMeta)
              break
            case "map":
              prototype[inverseUpdaterKey] = invUpd.one2map(store, propertyMeta)
              break
            case "set":
              prototype[inverseUpdaterKey] = invUpd.one2set(store, propertyMeta)
              break
          }
          break

        // property is an array
        case "array":
          switch (propertyMeta.inverseType) {
            case "object":
              prototype[inverseUpdaterKey] = invUpd.array2one(store, propertyMeta)
              break
            case "array":
              prototype[inverseUpdaterKey] = invUpd.array2array(store, propertyMeta)
              break
            case "map":
              prototype[inverseUpdaterKey] = invUpd.array2map(store, propertyMeta)
              break
            case "set":
              prototype[inverseUpdaterKey] = invUpd.array2set(store, propertyMeta)
              break
          }
          break

        // property is a map
        case "map":
          switch (propertyMeta.inverseType) {
            case "object":
              prototype[inverseUpdaterKey] = invUpd.map2one(store, propertyMeta)
              break
            case "array":
              prototype[inverseUpdaterKey] = invUpd.map2array(store, propertyMeta)
              break
            case "map":
              prototype[inverseUpdaterKey] = invUpd.map2map(store, propertyMeta)
              break
            case "set":
              prototype[inverseUpdaterKey] = invUpd.map2set(store, propertyMeta)
              break
          }
          break

        // property is a set
        case "set":
          switch (propertyMeta.inverseType) {
            case "object":
              prototype[inverseUpdaterKey] = invUpd.set2one(store, propertyMeta)
              break
            case "array":
              prototype[inverseUpdaterKey] = invUpd.set2array(store, propertyMeta)
              break
            case "map":
              prototype[inverseUpdaterKey] = invUpd.set2map(store, propertyMeta)
              break
            case "set":
              prototype[inverseUpdaterKey] = invUpd.set2set(store, propertyMeta)
              break
          }
          break
      }
    }
  }
  // Add disconnect method to the class
  addDisconnectMethod(prototype, typeMeta, store)
}

// add dynamically method to shallow copy props (including observables) from one instance to another
export function addCopyPropsMethod(prototype: any, typeMeta: TypeMeta) {
  prototype.copyProps = function (newObj: any, currentPrototype: any) {
    // Recursively copy properties from the superclass
    const superClass = Object.getPrototypeOf(currentPrototype)
    if (superClass !== EternalClass.prototype && typeof superClass.copyProps === "function") {
      superClass.copyProps.call(this, newObj, superClass) // Use this as the context
    }
    // Copy properties of the current type
    for (const [key, propertyMeta] of typeMeta.properties) {
      const privateKey = makePrivatePropertyKey(key)
      if (propertyMeta.type === "array") {
        ;(newObj[privateKey] as [any]).push(...this[privateKey])
      } else if (propertyMeta.type === "set") {
        ;(this[privateKey] as Set<any>).forEach((value) => {
          ;(newObj[privateKey] as Set<any>).add(value)
        })
      } else if (propertyMeta.type === "map") {
        ;(this[privateKey] as Map<any, any>).forEach((value, key) => {
          ;(newObj[privateKey] as Map<any, any>).set(key, value)
        })
      } else {
        newObj[privateKey] = this[privateKey]
      }
    }
  }
}

function addDisconnectMethod(prototype: any, typeMeta: TypeMeta, store: EternalStore) {
  const disconnectKey = makeDisconnectKey()

  // Precalculate properties that are references, including collections
  const referenceProps: PropertyMeta[] = []
  let currentMeta: TypeMeta | undefined = typeMeta

  // while (currentMeta) {
  for (const prop of currentMeta.properties.values()) {
    if (isReference(prop) || isCollectionOfReferences(prop)) {
      referenceProps.push(prop)
    }
  }
  //  currentMeta = currentMeta.superType;
  //}

  prototype[disconnectKey] = function () {
    const obj = this as EternalObject

    // Call disconnect method from superclass recursively
    const superProto = Object.getPrototypeOf(prototype)
    if (superProto && typeof superProto[disconnectKey] === "function") {
      superProto[disconnectKey].call(this)
    }
    // Disconnect references using meta information
    for (const prop of referenceProps) {
      const value = obj[prop.qName]
      if (prop.type === "array" && prop.itemType === "object") {
        // value.length = 0 // Clear the array // TODO restore this code when setting array  length is resolved
        for (let i = 0; i < value.length; i++) {
          if (value[i] && typeof value[i] === "object" && "uuid" in value[i]) {
            value.splice(i, 1) // Remove the element from the array
            i-- // Adjust index after removal
          }
        }
      } else if (prop.type === "map" && prop.itemType === "object") {
        value.clear() // Clear the map
      } else if (prop.type === "set" && prop.itemType === "object") {
        value.clear() // Clear the set
      } else if (prop.type === "object") {
        obj[prop.qName] = undefined // Use property setter to nullify the reference
      }
    }
  }
}
