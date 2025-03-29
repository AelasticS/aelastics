import { ArrayHandlers, createObservableArray } from "@aelastics/observables"
import { getClassName, isUUIDReference, makePrivatePropertyKey, makePrivateProxyKey, makeUpdateInverseKey, uniqueTimestamp } from "../store/utils" // Import the utility function
import { checkWriteAccess, checkReadAccess } from "../store/PropertyAccessors"
import { EternalObject } from "./InternalTypes"
import { ObservableExtra } from "../events/EventTypes"
import { PropertyMeta } from "../meta/InternalSchema"
import { EternalStore } from "../store/EternalStore"

import * as invUpd from "../store/inverseUpdaters"
import { EventPayload, Result } from "../events/EventTypes"
import { ChangeLogEntry } from "../events/ChangeLog"
import { State } from "../store/State"

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
  const subscriptionManager = store.getSubscriptionManager()

  if (!subscriptionManager) {
    throw new Error("Subscription manager not found.")
  }


  // Return the array handlers
  return {
    // Get element by index, if it is a UUID reference, return the object
    getByIndex: (target: T[], index: number) => {
      const obj = checkReadAccess(object, store)
      const newValue = obj[privateKey][index]
      const res = toObject(newValue, store, propDes)
      return [false, res]
    },
setByIndex: (target: T[], index: number, value: any): [boolean, T] => {
  const obj = checkWriteAccess(object, store, propDes.qName);
  const newValueUUID = toUUID(value, propDes);
  const oldValueUUID = obj[privateKey][index];

  // Check if there are changes to be made
  if (oldValueUUID === newValueUUID) {
    return [false, newValueUUID];
  }

  // Emit before.update event and check for cancellation
  const changes: ChangeLogEntry[] = [];
  if (oldValueUUID !== undefined) {
    changes.push({
      objectType: getClassName(object),
      objectId: object.uuid,
      operation: 'update' as const,
      changeType: 'remove' as const,
      property: propDes.qName,
      oldValue: oldValueUUID,
    });
  }
  if (newValueUUID !== undefined) {
    changes.push({
      objectType: getClassName(object),
      objectId: object.uuid,
      operation: 'update' as const,
      changeType: 'add' as const,
      property: propDes.qName,
      newValue: newValueUUID,
    });
  }

  if (changes.length > 0) {
    const beforeEvent: EventPayload = {
      timing: 'before',
      operation: 'update',
      objectType: getClassName(object),
      property: propDes.qName,
      timestamp: uniqueTimestamp(),
      objectId: object.uuid,
      changes: changes,
    };

    let result: Result = subscriptionManager.emit(beforeEvent);
    if (!result.success) {
      throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
    }
  }

  // Perform the actual operation
  obj[privateKey][index] = newValueUUID;
  if (propDes.itemType === "object" && propDes.inverseProp) {
    const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
    updater(obj, oldValueUUID, newValueUUID);
  }

  const state = store.getState()
  if (!state) {
    throw new Error("State not found.")
  }
  // Track the change
  state.trackChange(changes);

  // Emit after.update event and check for cancellation
  if (changes.length > 0) {
    const afterEvent: EventPayload = {
      timing: 'after',
      operation: 'update',
      objectType: getClassName(object),
      property: propDes.qName,
      timestamp: uniqueTimestamp(),
      objectId: object.uuid,
      changes: changes,
    };

    let result: Result = subscriptionManager.emit(afterEvent);
    if (!result.success) {
      throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
    }
  }

  return [false, newValueUUID];
},
    /** Remove item from array */
    delete: (target: T[], index: number): [boolean, boolean] => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const oldValueUUID = obj[privateKey][index];
    
      // Check if there are changes to be made
      if (oldValueUUID === undefined) {
        return [false, false];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [{
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'remove' as const,
        property: propDes.qName,
        oldValue: oldValueUUID,
      }];
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      obj[privateKey].splice(index, 1);
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        updater(obj, oldValueUUID, undefined);
      }
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, true];
    },
    /** Handle push (convert objects to UUIDs if needed) */
    push: (target: T[], ...items: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName) as EternalObject
      const itemsUUIDs = mapToUUIDs(items, propDes)
    
      // Check if there are changes to be made
      if (itemsUUIDs.length === 0) {
        return [false, target.length];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = itemsUUIDs.map((newValue, index) => ({
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'add' as const,
        property: propDes.qName,
        newValue: newValue,
        index:index,
      }));
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      const newLength = obj[privateKey].push(...itemsUUIDs);
    
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of newValue to object (connect to new value)
        items.forEach((item) => {
          updater(obj, undefined, item);
        });
      }
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, newLength];
    },

    /** Handle pop */
    pop: (target: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const item = obj[privateKey][obj[privateKey].length - 1] // Access the element to be popped
    
      // Check if there are changes to be made
      if (item === undefined) {
        return [false, undefined];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [{
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'remove' as const,
        property: propDes.qName,
        oldValue: item,
        index: obj[privateKey].length - 1,
      }];
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      const poppedItem = obj[privateKey].pop();
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, poppedItem, undefined)
      }
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, toObject(poppedItem, store, propDes)];
    },

    /** Handle shift */
    shift: (target: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const shiftedItem = obj[privateKey][0] // Access the element to be shifted
    
      // Check if there are changes to be made
      if (shiftedItem === undefined) {
        return [false, undefined];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [{
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'remove' as const,
        property: propDes.qName,
        oldValue: shiftedItem,
        index: 0,
      }];
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      const shiftedItemUUID = obj[privateKey].shift();
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey]
        updater(obj, shiftedItemUUID, undefined)
      }
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, toObject(shiftedItemUUID, store, propDes)];
    },

    /** Handle unshift (convert objects to UUIDs if needed) */
    unshift: (target: T[], ...items: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const itemsUUIDs = mapToUUIDs(items, propDes)
    
      // Check if there are changes to be made
      if (itemsUUIDs.length === 0) {
        return [false, target.length];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = itemsUUIDs.map((newValue, index) => ({
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'add' as const,
        property: propDes.qName,
        newValue: newValue,
        index:index,
      }));
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      const newLength = obj[privateKey].unshift(...itemsUUIDs);
    
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of newValue to object (connect to new value)
        items.forEach((item) => {
          updater(obj, undefined, item);
        });
      }
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, newLength];
    },

    /** Handle splice (convert objects to UUIDs if needed) */
    splice: (target: T[], start: number, deleteCount: number, ...items: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName)
      const itemsUUIDs = mapToUUIDs(items, propDes)
      const deletedItems:any[] = obj[privateKey].slice(start, start + deleteCount)
    
      // Check if there are changes to be made
      if (deletedItems.length === 0 && itemsUUIDs.length === 0) {
        return [false, []];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [];
      if (deletedItems.length > 0) {
        changes.push(...deletedItems.map((oldValue, index) => ({
          objectType: getClassName(object),
          objectId: object.uuid,
          operation: 'update' as const,
          changeType: 'remove' as const,
          property: propDes.qName,
          oldValue: oldValue,
          index: start + index,
        })));
      }
      if (itemsUUIDs.length > 0) {
        changes.push(...itemsUUIDs.map((newValue, index) => ({
          objectType: getClassName(object),
          objectId: object.uuid,
          operation: 'update' as const,
          changeType: 'add' as const,
          property: propDes.qName,
          newValue: newValue,
          index: start + index,
        })));
      }
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      const deletedItemsUUIDs = obj[privateKey].splice(start, deleteCount, ...itemsUUIDs);
    
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of deleted items to null
        deletedItemsUUIDs.forEach((item: any) => {
          updater(obj, item, undefined);
        });
        // set inverse of new items to object
        items.forEach((item: any) => {
          updater(obj, undefined, item);
        });
      }
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, mapToObjects(deletedItemsUUIDs, store, propDes)];
    },

    /** Handle reverse */
    reverse: (target: T[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const originalArray = [...obj[privateKey]]; // Copy the original array for comparison
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [{
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'reorder' as const,
        property: propDes.qName,
        oldValue: originalArray,
        newValue: [...originalArray].reverse(),
      }];
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      obj[privateKey].reverse();
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, obj[privateKey]];
    },

    /** Handle sort */
    sort: (target: T[], compareFn?: (a: T, b: T) => number) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const originalArray = [...obj[privateKey]]; // Copy the original array for comparison
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [{
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'reorder' as const,
        property: propDes.qName,
        oldValue: originalArray,
        newValue: [...originalArray].sort(compareFn),
      }];
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      obj[privateKey].sort(compareFn);
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, obj[privateKey]];
    },

    /** Handle fill */
    fill: (target: T[], value: T, start?: number, end?: number) => {
      if (propDes.itemType === "object") {
        throw new Error("Fill operation is not allowed for arrays of object UUIDs.");
      }
    
      const obj = checkWriteAccess(object, store, propDes.qName);
      const originalArray = [...obj[privateKey]]; // Copy the original array for comparison
      const itemsUUID = toUUID(value, propDes);
    
      // Determine the actual start and end indices
      const actualStart = start ?? 0;
      const actualEnd = end ?? obj[privateKey].length;
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [];
      for (let i = actualStart; i < actualEnd; i++) {
        changes.push({
          objectType: getClassName(object),
          objectId: object.uuid,
          operation: 'update' as const,
          changeType: 'add' as const,
          property: propDes.qName,
          oldValue: obj[privateKey][i],
          newValue: itemsUUID,
          index: i,
        });
      }
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      obj[privateKey].fill(itemsUUID, actualStart, actualEnd);
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, obj[privateKey]];
    },
    /** Handle concat */
    concat: (target: T[], ...items: (T | ConcatArray<T>)[]) => {
      const obj = checkWriteAccess(object, store, propDes.qName);
      const originalArray = [...obj[privateKey]]; // Copy the original array for comparison
    
      // Flatten the items array and map to UUIDs
      const itemsUUIDs = items.flat().map(item => toUUID(item, propDes));
    
      // Check if there are changes to be made
      if (itemsUUIDs.length === 0) {
        return [false, obj[privateKey]];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = itemsUUIDs.map((newValue, index) => ({
        objectType: getClassName(object),
        objectId: object.uuid,
        operation: 'update' as const,
        changeType: 'add' as const,
        property: propDes.qName,
        newValue: newValue,
        index: obj[privateKey].length + index,
      }));
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      const newArray = obj[privateKey].concat(itemsUUIDs);
    
      if (propDes.itemType === "object" && propDes.inverseProp) {
        const updater: invUpd.inverseUpdater = obj[inverseUpdaterKey];
        // set inverse of newValue to object (connect to new value)
        itemsUUIDs.forEach((item) => {
          updater(obj, undefined, item);
        });
      }
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, newArray];
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
    // TODO set length ??!
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
    copyWithin: (target: T[], targetIndex: number, start: number = 0, end: number = target.length) => {
      if (propDes.itemType === "object") {
        throw new Error("copyWithin operation is not allowed for arrays of object UUIDs.");
      }
    
      const obj = checkWriteAccess(object, store, propDes.qName);
      const originalArray = [...obj[privateKey]]; // Copy the original array for comparison
    
      // Determine the actual start, end, and target indices
      const actualStart = start;
      const actualEnd = end;
      const actualTargetIndex = targetIndex;
    
      // Check if there are changes to be made
      if (actualStart === actualEnd || actualTargetIndex >= obj[privateKey].length) {
        return [false, obj[privateKey]];
      }
    
      // Emit before.update event and check for cancellation
      const changes: ChangeLogEntry[] = [];
      for (let i = actualStart; i < actualEnd; i++) {
        const oldValue = obj[privateKey][actualTargetIndex + i - actualStart];
        const newValue = obj[privateKey][i];
        changes.push({
          objectType: getClassName(object),
          objectId: object.uuid,
          operation: 'update' as const,
          changeType: 'add' as const,
          property: propDes.qName,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
    
      const beforeEvent: EventPayload = {
        timing: 'before',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      let result: Result = subscriptionManager.emit(beforeEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by before.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      // Perform the actual operation
      obj[privateKey].copyWithin(actualTargetIndex, actualStart, actualEnd);
    
      // Track the change
      const state = store.getState()
      if (!state) {
        throw new Error("State not found.")
      }
      state.trackChange(changes);
    
      // Emit after.update event and check for cancellation
      const afterEvent: EventPayload = {
        timing: 'after',
        operation: 'update',
        objectType: getClassName(object),
        property: propDes.qName,
        timestamp: uniqueTimestamp(),
        objectId: object.uuid,
        changes: changes,
      };
    
      result = subscriptionManager.emit(afterEvent);
      if (!result.success) {
        throw new Error(`Transaction cancelled by after.update event: ${result.errors.map(e => e.message).join(', ')}`);
      }
    
      return [false, obj[privateKey]];
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
