import { ChangeLogEntry, hasChanges } from "./events/ChangeLog"
import { EternalStore } from "./EternalStore"
import { EternalObject } from "./handlers/InternalTypes"
import { getClassName, isObjectFrozen, makeDisconnectKey, uniqueTimestamp } from "./utils"
import { EventPayload, Result } from "./events/EventTypes"

/** Read-only interface for accessing immutable objects in a specific state */
interface StateView {
  getObject<T>(uuid: string): T | undefined
  index: number
}

// TODO add a trash for (soft) deleted objects

export class State implements StateView {
  public readonly timestamp: number // Track when this state was created
  private objectMap: Map<string, any> // Maps UUIDs to objects
  private store: WeakRef<EternalStore> // Reference to the store that owns this state
  public index: number // Index of this state in the store's history
  private changeLog: ChangeLogEntry[] = [] // Stores tracked changes

  constructor(store: EternalStore, previousState?: State) {
    this.timestamp = uniqueTimestamp() // Assign a unique timestamp for each state
    this.store = new WeakRef(store)
    this.index = previousState ? previousState.index + 1 : 0
    this.objectMap = new Map(previousState ? previousState.objectMap : [])
  }

  // Create a new object version
  public createNewVersion<T extends EternalObject>(obj: T, trackForNotification = true): T {
    // Check if the object is fixed
    if (isObjectFrozen(obj)) {
      throw new Error(`Cannot make a new version from a frozen object.`)
    }
    // check if object is from old state, then make a new version
    if (obj.createdAt < this.timestamp) {
      const newInstance: EternalObject = obj.clone()
      newInstance.createdAt = this.timestamp // Copy timestamp from state
      // Track the new version
      obj.nextVersion = new WeakRef(newInstance)
      this.addObject(newInstance, "versioned")
      // TODO check subscriptions - track for notifications !!!
      if (trackForNotification) {
        this.store.deref()?.trackVersionedObject(newInstance) // Track for notifications
      }
      return newInstance as T
    }
    // If object is already from this state, return the object itself
    return obj
  }
  // Track an object for versioning
  public trackVersionedObject(obj: EternalObject): void {
    this.store?.deref()?.trackVersionedObject(obj)
  }

  /** Retrieves an object from this specific state */
  public getObject<T>(uuid: string, frozen = false): T | undefined {
    const obj = this.getDynamicObject<EternalObject>(uuid)
    if (!obj) return undefined
    // If requested, return a frozen object
    if (frozen) {
      return this.createFrozenStateObject(obj) as T // copy which cannot be changed
    }
    return obj as T
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
    if (object.createdAt > this.timestamp) {
      throw new Error(`Cannot access object ${uuid} from a future state.`)
    }
    return object // Returns the object without fixing it
  }

  private createFrozenStateObject<T extends EternalObject>(obj: T): T {
    // Create a shallow copy of the object
    const frozenObject = obj.clone(this)
    return frozenObject as T
  }

  public isObjectFrozenInState(obj: EternalObject): boolean {
    return obj.state === this
  }

  /**
   * Adds a new object to the state.
   * - Assigns a UUID if missing.
   * - Tracks insertion in the change log.
   */
  public addObject<T extends EternalObject>(obj: T, reason: "created" | "imported" | "versioned"): void {
    if (reason === "created") {
      const subscriptionManager = this.store.deref()?.getSubscriptionManager()
      if (!subscriptionManager) {
        throw new Error("Subscription manager not found.")
      }

      // Create the change entry
      const change: ChangeLogEntry = {
        objectType: getClassName(obj),
        objectId: obj.uuid,
        operation: "create",
        newValue: obj,
      }

      // Emit before.create.object event and check for cancellation
      const beforeEvent: EventPayload = {
        timing: "before",
        operation: "create",
        objectType: getClassName(obj),
        timestamp: uniqueTimestamp(),
        objectId: obj.uuid,
        changes: [change],
      }

      let result: Result = subscriptionManager.emit(beforeEvent)
      if (!result.success) {
        throw new Error(
          `Transaction cancelled by before.create.object event: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }

      // Store the object in the state
      this.objectMap.set(obj.uuid, obj)

      // Track the change
      this.trackChange(change)

      // Emit after.create.object event and check for cancellation
      const afterEvent: EventPayload = {
        timing: "after",
        operation: "create",
        objectType: getClassName(obj),
        timestamp: uniqueTimestamp(),
        objectId: obj.uuid,
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
      this.objectMap.set(obj.uuid, obj)
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
  public isFromOlderState(obj: EternalObject): boolean {
    // If object's timestamp is older than the current state
    return obj.createdAt < this.timestamp
  }

  public isCreatedInState(obj: EternalObject): boolean {
    // If object's timestamp is equal the current state
    return obj.createdAt === this.timestamp
  }

  // Check if an object is member of this state
  public isMemberOfState(obj: EternalObject): boolean {
    const member = this.objectMap.get(obj.uuid)
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
