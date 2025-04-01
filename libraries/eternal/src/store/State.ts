import { ChangeLogEntry, hasChanges } from "../events/ChangeLog"
import { StoreClass } from "./StoreClass"
import { createdAt, nextVersion, state, StoreObject, uuid } from "../handlers/InternalTypes"
import { getClassName, isObjectFrozen, makeDisconnectKey, uniqueTimestamp } from "./utils"
import { EventPayload, Result } from "../events/EventTypes"

/** Read-only interface for accessing immutable objects in a specific state */
interface StateView {
  getObject<T>(uuid: string): T | undefined
  index: number
}

// TODO add a trash for (soft) deleted objects

export class State implements StateView {
  public readonly timestamp: number // Track when this state was created
  private objectMap: Map<string, any> // Maps UUIDs to objects
  private store: WeakRef<StoreClass> // Reference to the store that owns this state
  public index: number // Index of this state in the store's history
  private changeLog: ChangeLogEntry[] = [] // Stores tracked changes

  constructor(store: StoreClass, previousState?: State) {
    this.timestamp = uniqueTimestamp() // Assign a unique timestamp for each state
    this.store = new WeakRef(store)
    this.index = previousState ? previousState.index + 1 : 0
    this.objectMap = new Map(previousState ? previousState.objectMap : [])
  }

  // Create a new object version
  public createNewVersion<T extends StoreObject>(obj: T, trackForNotification = true): T {
    // Check if the object is fixed
    if (isObjectFrozen(obj)) {
      throw new Error(`Cannot make a new version from a frozen object.`)
    }
    // check if object is from old state, then make a new version
    if (obj[createdAt] < this.timestamp) {
      const newInstance: StoreObject = obj.clone()
      newInstance[createdAt] = this.timestamp // Copy timestamp from state
      // Track the new version
      obj[nextVersion] = new WeakRef(newInstance)
      this.addObject(newInstance, "versioned")
      return newInstance as T
    }
    // If object is already from this state, return the object itself
    return obj
  }

  /** Retrieves an object from this specific state */
  public getObject<T>(uuid: string, frozen = false): T | undefined {
    const obj = this.getDynamicObject<StoreObject>(uuid)
    if (!obj) return undefined
    // If requested, return a frozen object
    if (frozen) {
      return this.createFrozenStateObject(obj) as T // copy which cannot be changed
    }
    return obj as T
  }

    /** Retrieves objects of a specific type from the state which satisfy predicate*/
    public findObjects<T>(objectType: string, predicate?: (obj: T) => boolean): T[] {
      return Array.from(this.objectMap.values()).filter((obj) => {
      return getClassName(obj) === objectType && (!predicate || predicate(obj as T));
      }) as T[];
    }

  /** Retrieves an object which can be changed */
  public getDynamicObject<T>(uuid: string): T | undefined {
    if (uuid === undefined || uuid === null) {
      return undefined
    }
    if (typeof uuid !== "string") {
      throw new Error("UUID must be a string.")
    }
    const object = this.objectMap.get(uuid)
    // Ensure the object is not from a future state
    // if (object[createdAt] > this.timestamp) {
    //   throw new Error(`Cannot access object ${uuid} from a future state.`)
    // }
    return object // Returns the object without fixing it
  }

  private createFrozenStateObject<T extends StoreObject>(obj: T): T {
    // Create a shallow copy of the object
    const frozenObject = obj.clone(this)
    return frozenObject as T
  }

  public isObjectFrozenInState(obj: StoreObject): boolean {
    return obj[state] === this
  }

  /**
   * Adds a new object to the state.
   * - Assigns a UUID if missing.
   * - Tracks insertion in the change log.
   */
  public addObject<T extends StoreObject>(obj: T, reason: "created" | "imported" | "versioned"): void {
    if (reason === "created" || reason === "imported") {
      const operationType = reason === "created" ? "create" : "import"
      const subscriptionManager = this.store.deref()?.getSubscriptionManager()
      if (!subscriptionManager) {
        throw new Error("Subscription manager not found.")
      }

      // Create the change entry
      const change: ChangeLogEntry = {
        objectType: getClassName(obj),
        objectId: obj[uuid],
        operation: operationType,
        newValue: obj,
      }

      // Emit before.create.object event and check for cancellation
      const beforeEvent: EventPayload = {
        timing: "before",
        operation: operationType,
        objectType: getClassName(obj),
        timestamp: uniqueTimestamp(),
        objectId: obj[uuid],
        changes: [change],
      }

      let result: Result = subscriptionManager.emit(beforeEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by before.create.object event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      // Store the object in the state
      this.objectMap.set(obj[uuid], obj)

      // Track the change
      this.trackChange(change)

      // Emit after.create.object event and check for cancellation
      const afterEvent: EventPayload = {
        timing: "after",
        operation: operationType,
        objectType: getClassName(obj),
        timestamp: uniqueTimestamp(),
        objectId: obj[uuid],
        changes: [change],
      }

      result = subscriptionManager.emit(afterEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by after.create.object event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }
    } else {
      // Store the object in the state without emitting events or tracking changes
      this.objectMap.set(obj[uuid], obj)
    }
  }

  /**
   * Deletes an object from the state.
   * - Removes all references to the object.
   * - Ensures bidirectional relationships are updated.
   * - Tracks the deletion in the change log.
   */
  public deleteObject(objectId: string): void {
    const subscriptionManager = this.store.deref()?.getSubscriptionManager()
    if (!subscriptionManager) {
      throw new Error("Subscription manager not found.")
    }

    const obj = this.objectMap.get(objectId)
    if (!obj) {
      throw new Error("Object not found.")
    }

    // Create the change entry
    const change: ChangeLogEntry = {
      objectType: getClassName(obj),
      objectId: objectId,
      operation: "delete",
    }

    // Emit before.delete.object event and check for cancellation
    const beforeEvent: EventPayload = {
      timing: "before",
      operation: "delete",
      objectType: getClassName(obj),
      timestamp: uniqueTimestamp(),
      objectId: objectId,
      changes: [change],
    }

    let result: Result = subscriptionManager.emit(beforeEvent)
    if (!result.success) {
      throw new Error(
        `Transaction cancelled by before.delete.object event: ${result.errors.map((e) => e.message).join(", ")}`
      )
    }

    // Disconnect the object from all other objects
    const disconnectKey = makeDisconnectKey()
    if (typeof obj[disconnectKey] === "function") {
      obj[disconnectKey]()
    }

    // Remove the object from the state
    this.objectMap.delete(objectId)

    // Track the change
    this.trackChange(change)

    // Emit after.delete.object event and check for cancellation
    const afterEvent: EventPayload = {
      timing: "after",
      operation: "delete",
      objectType: getClassName(obj),
      timestamp: uniqueTimestamp(),
      objectId: objectId,
      changes: [change],
    }

    result = subscriptionManager.emit(afterEvent)
    if (!result.success) {
      throw new Error(
        `Transaction cancelled by after.delete.object event: ${result.errors.map((e) => e.message).join(", ")}`
      )
    }
  }

  // Check if an object is older then this state
  public isFromOlderState(obj: StoreObject): boolean {
    // If object's timestamp is older than the current state
    return obj[createdAt] < this.timestamp
  }

  public isCreatedInState(obj: StoreObject): boolean {
    // If object's timestamp is equal the current state
    return obj[createdAt] === this.timestamp
  }

  // Check if an object is member of this state
  public isMemberOfState(obj: StoreObject): boolean {
    const member = this.objectMap.get(obj[uuid])
    return member === obj
  }

  // Track changed objects
  public trackChange(entry: ChangeLogEntry | ChangeLogEntry[]): void {
    if (Array.isArray(entry)) {
      this.changeLog.push(...entry)
    } else {
      this.changeLog.push(entry)
    }
  }

  public getChangeLog(): ChangeLogEntry[] {
    return this.changeLog
  }
}
