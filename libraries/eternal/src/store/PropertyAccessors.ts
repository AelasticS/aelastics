// Adapter functions to work with new registry PropertyMeta format
function isReference(prop: PropertyMeta, store?: StoreClass): boolean {
  if (store) {
    // Try new registry-based resolution first
    const resolvedType = store.registry.getType(prop.typeRef);
    if (resolvedType && resolvedType.category === 'complex') {
      return resolvedType.kind === 'object' || resolvedType.kind === 'entity';
    }
  }
  // Fallback to string-based detection
  return prop.typeRef.includes("object") && !prop.typeRef.includes("array") && !prop.typeRef.includes("set") && !prop.typeRef.includes("map");
}

function isCollectionOfReferences(prop: PropertyMeta, store?: StoreClass): boolean {
  if (store) {
    // Try new registry-based resolution first
    const resolvedType = store.registry.getType(prop.typeRef);
    if (resolvedType && resolvedType.category === 'complex') {
      if (resolvedType.kind === 'array' || resolvedType.kind === 'set' || resolvedType.kind === 'map') {
        // For collections, check if they contain object references
        // TODO: Check element type for collections - for now use string fallback
        return prop.typeRef.includes("object");
      }
    }
  }
  // Fallback to string-based detection
  return (prop.typeRef.includes("array") || prop.typeRef.includes("map") || prop.typeRef.includes("set")) && prop.typeRef.includes("object");
}

function getPropertyTypeKind(typeRef: string, store?: StoreClass): string {
  if (store) {
    // Try new registry-based resolution first
    const resolvedType = store.registry.getType(typeRef);
    if (resolvedType) {
      if (resolvedType.category === 'simple') {
        return "primitive";
      } else if (resolvedType.category === 'complex') {
        switch (resolvedType.kind) {
          case 'array': return "array";
          case 'map': return "map";
          case 'set': return "set";
          case 'object':
          case 'entity':
            return "object";
          default: return "primitive";
        }
      }
    }
  }
  // Fallback to string-based detection
  if (typeRef.includes("array")) return "array";
  if (typeRef.includes("map")) return "map";
  if (typeRef.includes("set")) return "set";
  if (typeRef.includes("object")) return "object";
  return "primitive";
}

function createCollectionProxy(obj: StoreObject, propertyName: string, propertyMeta: PropertyMeta, store: StoreClass): any {
  const privateKey = makePrivatePropertyKey(propertyName);
  const propTypeKind = getPropertyTypeKind(propertyMeta.typeRef, store);
  
  // Initialize the underlying collection if it doesn't exist
  if (!obj[privateKey]) {
    if (propTypeKind === "array") {
      obj[privateKey] = [];
    } else if (propTypeKind === "set") {
      obj[privateKey] = new Set();
    } else if (propTypeKind === "map") {
      obj[privateKey] = new Map();
    }
  }
  
  const collection = obj[privateKey];
  
  // Create a basic proxy that forwards operations to the underlying collection
  // TODO: Add proper change tracking and inverse relationship management
  if (propTypeKind === "array") {
    return new Proxy(collection, {
      get(target, prop) {
        if (typeof prop === 'string' && ['push', 'pop', 'shift', 'unshift', 'splice'].includes(prop)) {
          return function(...args: any[]) {
            console.warn(`Array operation ${prop} not fully implemented with change tracking`);
            return (target as any)[prop](...args);
          };
        }
        return target[prop as any];
      }
    });
  } else if (propTypeKind === "set") {
    return new Proxy(collection, {
      get(target, prop) {
        if (typeof prop === 'string' && ['add', 'delete', 'clear'].includes(prop)) {
          return function(...args: any[]) {
            console.warn(`Set operation ${prop} not fully implemented with change tracking`);
            return (target as any)[prop](...args);
          };
        }
        return target[prop as any];
      }
    });
  } else if (propTypeKind === "map") {
    return new Proxy(collection, {
      get(target, prop) {
        if (typeof prop === 'string' && ['set', 'delete', 'clear'].includes(prop)) {
          return function(...args: any[]) {
            console.warn(`Map operation ${prop} not fully implemented with change tracking`);
            return (target as any)[prop](...args);
          };
        }
        return target[prop as any];
      }
    });
  }
  
  return collection;
}
import { PropertyMeta, TypeMeta, ObjectTypeMeta } from "../registry/TypeDefinitions"
import { StoreClass } from "./StoreClass"
import { __StoreSuperClass__, nextVersion, StoreObject, uuid } from "./InternalTypes"
import {
  getClassName,
  isObjectFrozen,
  makeDisconnectKey,
  makePrivatePropertyKey,
  makePrivateProxyKey,
  makeUpdateInverseKey,
  uniqueTimestamp,
} from "./utils"

// Inverse updater functions for new registry system
function createOne2OneUpdater(store: StoreClass, propertyMeta: PropertyMeta): any {
  const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
  const privateKey = makePrivatePropertyKey(propertyMeta.name);
  
  return function(obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
    let oldObj: StoreObject | undefined;
    
    if (disconnectedObject) {
      const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject[uuid];
      if (oldUUID && (oldObj = store.objectManager.findByUUID<StoreObject>(oldUUID))) {
        oldObj = checkWriteAccess(oldObj, store, propertyMeta.name);
        oldObj[privateInverseKey] = undefined;
      }
    }
    
    let newObj: StoreObject | undefined;
    
    if (connectedObject) {
      const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject[uuid];
      if (newUUID && (newObj = store.objectManager.findByUUID<StoreObject>(newUUID))) {
        newObj = checkWriteAccess(newObj, store, propertyMeta.name);
        
        // Check if the target object is already connected to someone else (steal semantics)
        const currentConnectionUUID = newObj[privateInverseKey];
        if (currentConnectionUUID && currentConnectionUUID !== obj[uuid]) {
          // Clear the old connection first
          const currentlyConnectedObj = store.objectManager.findByUUID<StoreObject>(currentConnectionUUID);
          if (currentlyConnectedObj) {
            const checkedCurrentObj = checkWriteAccess(currentlyConnectedObj, store, propertyMeta.inverseProp!);
            checkedCurrentObj[privateKey] = undefined;
          }
        }
        
        // Now set the new connection
        newObj[privateInverseKey] = obj[uuid];
      }
    }
  };
}

function createOne2ArrayUpdater(store: StoreClass, propertyMeta: PropertyMeta): any {
  const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
  
  return function(obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
    let oldObj: StoreObject | undefined;
    
    if (disconnectedObject) {
      const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject[uuid];
      if (oldUUID && (oldObj = store.objectManager.findByUUID<StoreObject>(oldUUID))) {
        oldObj = checkWriteAccess(oldObj, store, propertyMeta.name);
        const array = oldObj[privateInverseKey];
        if (array && Array.isArray(array)) {
          const index = array.indexOf(obj[uuid]);
          if (index > -1) {
            array.splice(index, 1);
          }
        }
      }
    }
    
    let newObj: StoreObject | undefined;
    
    if (connectedObject) {
      const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject[uuid];
      if (newUUID && (newObj = store.objectManager.findByUUID<StoreObject>(newUUID))) {
        newObj = checkWriteAccess(newObj, store, propertyMeta.name);
        const array = newObj[privateInverseKey];
        if (array && Array.isArray(array) && !array.includes(obj[uuid])) {
          array.push(obj[uuid]);
        }
      }
    }
  };
}

function createArray2OneUpdater(store: StoreClass, propertyMeta: PropertyMeta): any {
  const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
  
  return function(obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
    let oldObj: StoreObject | undefined;
    
    if (disconnectedObject) {
      const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject[uuid];
      if (oldUUID && (oldObj = store.objectManager.findByUUID<StoreObject>(oldUUID))) {
        oldObj = checkWriteAccess(oldObj, store, propertyMeta.name);
        oldObj[privateInverseKey] = undefined;
      }
    }
    
    let newObj: StoreObject | undefined;
    
    if (connectedObject) {
      const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject[uuid];
      if (newUUID && (newObj = store.objectManager.findByUUID<StoreObject>(newUUID))) {
        newObj = checkWriteAccess(newObj, store, propertyMeta.name);
        const oldUUID = newObj[privateInverseKey];
        
        if (oldUUID && (oldObj = store.objectManager.findByUUID<StoreObject>(oldUUID))) {
          oldObj = checkWriteAccess(oldObj, store, propertyMeta.name);
          const privateKey = makePrivatePropertyKey(propertyMeta.name);
          const array = oldObj[privateKey];
          if (array && Array.isArray(array)) {
            const index = array.indexOf(obj[uuid]);
            if (index > -1) {
              array.splice(index, 1);
            }
          }
        }
        newObj[privateInverseKey] = obj[uuid];
      }
    }
  };
}

function createArray2ArrayUpdater(store: StoreClass, propertyMeta: PropertyMeta): any {
  const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
  
  return function(obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
    let oldObj: StoreObject | undefined;
    
    if (disconnectedObject) {
      const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject[uuid];
      if (oldUUID && (oldObj = store.objectManager.findByUUID<StoreObject>(oldUUID))) {
        oldObj = checkWriteAccess(oldObj, store, propertyMeta.name);
        const array = oldObj[privateInverseKey];
        if (array && Array.isArray(array)) {
          const index = array.indexOf(obj[uuid]);
          if (index > -1) {
            array.splice(index, 1);
          }
        }
      }
    }
    
    let newObj: StoreObject | undefined;
    
    if (connectedObject) {
      const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject[uuid];
      if (newUUID && (newObj = store.objectManager.findByUUID<StoreObject>(newUUID))) {
        newObj = checkWriteAccess(newObj, store, propertyMeta.name);
        const array = newObj[privateInverseKey];
        if (array && Array.isArray(array) && !array.includes(obj[uuid])) {
          array.push(obj[uuid]);
        }
      }
    }
  };
}

function createOne2SetUpdater(store: StoreClass, propertyMeta: PropertyMeta): any {
  const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
  
  return function(obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
    let oldObj: StoreObject | undefined;
    
    if (disconnectedObject) {
      const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject[uuid];
      if (oldUUID && (oldObj = store.objectManager.findByUUID<StoreObject>(oldUUID))) {
        oldObj = checkWriteAccess(oldObj, store, propertyMeta.name);
        const set = oldObj[privateInverseKey];
        if (set && set instanceof Set) {
          set.delete(obj[uuid]);
        }
      }
    }
    
    let newObj: StoreObject | undefined;
    
    if (connectedObject) {
      const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject[uuid];
      if (newUUID && (newObj = store.objectManager.findByUUID<StoreObject>(newUUID))) {
        newObj = checkWriteAccess(newObj, store, propertyMeta.name);
        const set = newObj[privateInverseKey];
        if (set && set instanceof Set) {
          set.add(obj[uuid]);
        }
      }
    }
  };
}

function createOne2MapUpdater(store: StoreClass, propertyMeta: PropertyMeta): any {
  const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
  
  return function(obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
    let oldObj: StoreObject | undefined;
    
    if (disconnectedObject) {
      const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject[uuid];
      if (oldUUID && (oldObj = store.objectManager.findByUUID<StoreObject>(oldUUID))) {
        oldObj = checkWriteAccess(oldObj, store, propertyMeta.name);
        const map = oldObj[privateInverseKey];
        if (map && map instanceof Map) {
          map.delete(obj[uuid]);
        }
      }
    }
    
    let newObj: StoreObject | undefined;
    
    if (connectedObject) {
      const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject[uuid];
      if (newUUID && (newObj = store.objectManager.findByUUID<StoreObject>(newUUID))) {
        newObj = checkWriteAccess(newObj, store, propertyMeta.name);
        const map = newObj[privateInverseKey];
        if (map && map instanceof Map) {
          map.set(obj[uuid], obj[uuid]);
        }
      }
    }
  };
}

import { EventPayload, Result } from "../events/EventTypes"
import { ChangeLogEntry } from "../events/ChangeLog"

// check access and return correct version of object

export function checkReadAccess(obj: StoreObject, store: StoreClass): StoreObject {
  const state = store.getState()
  const isFrozen = isObjectFrozen(obj)
  const isInUpdateMode = store.isInUpdateMode()

  if (isInUpdateMode) {
    if (obj[nextVersion]) {
      const objNextVersion = obj[nextVersion].deref()
      if (!isFrozen && state.isCreatedInState(objNextVersion)) {
        return objNextVersion
      }
      if (!isFrozen) {
        throw new Error(
          `Invalid reference to object ${obj.constructor.name}: ${obj[uuid]} from a past state.\n` +
            `Use 'store.getObject(uuid)' to retrieve the current version of the object, or 'store.getFromState(stateIndex, uuid)' to access it from an old state.`
        )
      }
    }
    return obj
  }
  if (!isFrozen && obj[nextVersion] && !state.isMemberOfState(obj)) {
    throw new Error(
      `Invalid reference to object ${obj.constructor.name}: ${obj[uuid]} from a past state.\n` +
        `Use 'store.getObject(uuid)' to retrieve the current version of the object, or 'store.getFromState(stateIndex, uuid)' to access it from an old state.`
    )
  }
  return obj
}

export function checkWriteAccess(obj: StoreObject, store: StoreClass, key: string): StoreObject {
  // if not allowed update throw error
  if (isObjectFrozen(obj)) {
    throw new Error(`Cannot modify property "${key}" of the frozen object"`)
  }
  // if not in update mode throw error
  if (!store.isInUpdateMode()) {
    throw new Error(
      `Cannot modify the object directly. Use the 'update()' method to make changes to objects.`
    )
  }

  // if obj is from old state
  if (store.getState().isFromOlderState(obj)) {
    if (!obj[nextVersion]) {
      // has no new version, create and return new version
      return store.getState().createNewVersion(obj)
    } else {
      // has new version, return new version
      const objNextVersion = obj[nextVersion].deref()
      // return only if new version belongs to the current state
      if (store.getState().isCreatedInState(objNextVersion)) {
        return objNextVersion
      } else {
        throw new Error(`Illegal reference to an object not from the current state.`)
      }
    }
  }
  // obj is from current state
  return obj
}

/** Adds optimized property accessors to a dynamically generated class prototype */
export function addPropertyAccessors(prototype: any, typeMeta: TypeMeta, store: StoreClass) {
  const subscriptionManager = store.subscriptionManager

  if (!subscriptionManager) {
    throw new Error("Subscription manager not found.")
  }


  // Check if typeMeta.properties is defined and is a Map
  const objectTypeMeta = typeMeta as ObjectTypeMeta;
  if (!objectTypeMeta.properties || !(objectTypeMeta.properties instanceof Map)) {
    throw new Error(`Invalid properties for typeMeta: ${typeMeta.qName}`)
  }
  const allProps = store.getAllProperties(typeMeta.qName)
  for (const [key, propertyMeta] of allProps) {
    const privateKey = makePrivatePropertyKey(key)
    const proxyKey = makePrivateProxyKey(key)
    const inverseUpdaterKey = makeUpdateInverseKey(key)
    const privateInverseKey = propertyMeta.inverseProp ? makePrivatePropertyKey(propertyMeta.inverseProp) : ""

    if (!propertyMeta) {
      throw new Error(`Property metadata for key "${key}" is undefined in typeMeta: ${typeMeta.qName}`)
    }

    // Generate optimized getter
    let getter: (this: StoreObject) => any
    if (getPropertyTypeKind(propertyMeta.typeRef, store) === "object") {
      getter = function (this: StoreObject) {
        let obj = checkReadAccess(this, store)
        return store.objectManager.findByUUID(obj[privateKey]) // Directly resolve UUIDs
      }
    } else {
      getter = function (this: any) {
        let obj = checkReadAccess(this, store)
        return obj[privateKey] // Directly return stored value
      }
    }

    // Generate optimized setter
    let setter: (this: StoreObject, value: any) => void

    // TODO add to changelog

    const propTypeKind = getPropertyTypeKind(propertyMeta.typeRef, store);
    if (propTypeKind === "array" || propTypeKind === "set" || propTypeKind === "map") {
      getter = function () {
        let obj = checkReadAccess(this, store)
        
        // Create proxy if it doesn't exist
        if (!obj[proxyKey]) {
          obj[proxyKey] = createCollectionProxy(obj, key, propertyMeta, store);
        }
        
        return obj[proxyKey]
      }
      // Prevent direct assignment to collection properties
      setter = function () {
        // TODO in future: create proxy, disconnect old and connect new elements
        throw new Error(`Cannot directly assign to collection property "${key}" of an object"`)
      }
    } else if (propTypeKind === "object") {
      setter = function (this: StoreObject, value: StoreObject | undefined) {
        // Validate that the value is an object, undefined, or null, but not an array or any other special object
        if (value !== null && value !== undefined && (typeof value !== "object" || Array.isArray(value))) {
          throw new Error(`Invalid value for property "${key}". Expected an object, null, or undefined.`);
        }
        // Prevent redundant updates
        // if (this[privateKey] === value[uuid] && store.isInUpdateMode()) {
          if (value && this[privateKey] === value[uuid] && store.isInUpdateMode()) {
          return
        }

        // Emit before.update event and check for cancellation
        const oldUUID = this[privateKey]
        const newUUID = value? value[uuid] : undefined
        const changes: ChangeLogEntry[] = [
          {
            objectType: getClassName(this),
            objectId: this[uuid],
            operation: "update" as const,
            changeType: "replace" as const,
            property: key,
            oldValue: oldUUID,
            newValue: newUUID,
          },
        ]

        const beforeEvent: EventPayload = {
          timing: "before",
          operation: "update",
          objectType: typeMeta.qName,
          property: propertyMeta.name,
          timestamp: uniqueTimestamp(),
          objectId: this[uuid],
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
        if (propertyMeta.inverseTypeRef && propertyMeta.inverseProp && (oldUUID || value)) {
          const updater: any = obj[inverseUpdaterKey]
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
          timing: "after",
          operation: "update",
          objectType: typeMeta.qName,
          property: propertyMeta.name,
          timestamp: uniqueTimestamp(),
          objectId: this[uuid],
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
      setter = function (this: StoreObject, value: any) {
        // Validate that the value has the correct primitive type
        const expectedType = getPropertyTypeKind(propertyMeta.typeRef, store)
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
            objectType: getClassName(this),
            objectId: this[uuid],
            operation: "update" as const,
            changeType: "replace" as const,
            property: key,
            oldValue: oldValue,
            newValue: value,
          },
        ]

        const beforeEvent: EventPayload = {
          timing: "before",
          operation: "update",
          objectType: typeMeta.qName,
          property: propertyMeta.name,
          timestamp: uniqueTimestamp(),
          objectId: this[uuid],
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
          timing: "after",
          operation: "update",
          objectType: typeMeta.qName,
          property: propertyMeta.name,
          timestamp: uniqueTimestamp(),
          objectId: this[uuid],
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

    if (propertyMeta.inverseTypeRef && propertyMeta.inverseProp) {
      const propertyTypeKind = getPropertyTypeKind(propertyMeta.typeRef, store);
      const inverseType = propertyMeta.inverseType;
      
      switch (propertyTypeKind) {
        // property is an object
        case "object":
          if (inverseType === "object") {
            prototype[inverseUpdaterKey] = createOne2OneUpdater(store, propertyMeta);
          } else if (inverseType === "array") {
            prototype[inverseUpdaterKey] = createOne2ArrayUpdater(store, propertyMeta);
          } else if (inverseType === "set") {
            prototype[inverseUpdaterKey] = createOne2SetUpdater(store, propertyMeta);
          } else if (inverseType === "map") {
            prototype[inverseUpdaterKey] = createOne2MapUpdater(store, propertyMeta);
          }
          break

        // property is an array
        case "array":
          if (inverseType === "object") {
            prototype[inverseUpdaterKey] = createArray2OneUpdater(store, propertyMeta);
          } else if (inverseType === "array") {
            prototype[inverseUpdaterKey] = createArray2ArrayUpdater(store, propertyMeta);
          }
          break

        // property is a map
        case "map":
          if (inverseType === "object") {
            prototype[inverseUpdaterKey] = createArray2OneUpdater(store, propertyMeta);
          } else if (inverseType === "array") {
            prototype[inverseUpdaterKey] = createArray2ArrayUpdater(store, propertyMeta);
          }
          break

        // property is a set
        case "set":
          if (inverseType === "object") {
            prototype[inverseUpdaterKey] = createArray2OneUpdater(store, propertyMeta);
          } else if (inverseType === "array") {
            prototype[inverseUpdaterKey] = createArray2ArrayUpdater(store, propertyMeta);
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
    if (superClass !== __StoreSuperClass__.prototype && typeof superClass.copyProps === "function") {
      superClass.copyProps.call(this, newObj, superClass) // Use this as the context
    }
    // Copy properties of the current type
    for (const [key, propertyMeta] of (typeMeta as ObjectTypeMeta).properties || new Map()) {
      const privateKey = makePrivatePropertyKey(key)
      if (propertyMeta.typeRef.includes("array")) {
        ;(newObj[privateKey] as [any]).push(...this[privateKey])
      } else if (propertyMeta.typeRef.includes("set")) {
        ;(this[privateKey] as Set<any>).forEach((value) => {
          ;(newObj[privateKey] as Set<any>).add(value)
        })
      } else if (propertyMeta.typeRef.includes("map")) {
        ;(this[privateKey] as Map<any, any>).forEach((value, key) => {
          ;(newObj[privateKey] as Map<any, any>).set(key, value)
        })
      } else {
        newObj[privateKey] = this[privateKey]
      }
    }
  }
}

function addDisconnectMethod(prototype: any, typeMeta: TypeMeta, store: StoreClass) {
  const disconnectKey = makeDisconnectKey()

  // Precalculate properties that are references, including collections
  const referenceProps: PropertyMeta[] = []
  let currentMeta: TypeMeta | undefined = typeMeta

  // while (currentMeta) {
  
  for (const prop of (currentMeta as ObjectTypeMeta).properties?.values() || []) {
    if (isReference(prop, store) || isCollectionOfReferences(prop, store)) {
      referenceProps.push(prop)
    }
  }
  //  currentMeta = currentMeta.superType;
  //}

  prototype[disconnectKey] = function () {
    const obj = this as StoreObject

    // Call disconnect method from superclass recursively
    const superProto = Object.getPrototypeOf(prototype)
    if (superProto && typeof superProto[disconnectKey] === "function") {
      superProto[disconnectKey].call(this)
    }
    // Disconnect references using meta information
    for (const prop of referenceProps) {
      const value = obj[prop.name]
      if (prop.typeRef.includes("array") && prop.typeRef.includes("object")) {
        // value.length = 0 // Clear the array // TODO restore this code when setting array  length is resolved
        for (let i = 0; i < value.length; i++) {
          if (value[i] && typeof value[i] === "object" && "uuid" in value[i]) {
            value.splice(i, 1) // Remove the element from the array
            i-- // Adjust index after removal
          }
        }
      } else if (prop.typeRef.includes("map") && prop.typeRef.includes("object")) {
        value.clear() // Clear the map
      } else if (prop.typeRef.includes("set") && prop.typeRef.includes("object")) {
        value.clear() // Clear the set
      } else if (prop.typeRef.includes("object")) {
        obj[prop.name] = undefined // Use property setter to nullify the reference
      }
    }
  }
}
