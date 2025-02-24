import { ChangeLogEntry, hasChanges } from "./ChangeLog"
import { EternalStore } from "./EternalStore"
import { EternalObject } from "./handlers/InternalTypes"
import { isObjectFrozen, uniqueTimestamp } from "./utils"

/** Read-only interface for accessing immutable objects in a specific state */
interface StateView {
  getObject<T>(uuid: string): T | undefined
  index: number
}

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
      this.addObject(newInstance, 'versioned')
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
    const object = this.objectMap.get(uuid)
    // Ensure the object is not from a future state
    if (object.createdAt > this.timestamp) {
      throw new Error(`Cannot access object ${uuid} from a future state.`)
    }
    return object // Returns the object without fixing it
  }

  private createFrozenStateObject<T extends EternalObject>(obj: T): T {
    // Create a shallow copy of the object
    const frozenObject = obj.clone()  
    // Attach a fixed state reference
    Object.defineProperty(frozenObject, "state", {
      value: this,
      writable: false, // Ensure it cannot be changed
      enumerable: false, // Hide it from object iteration
    })
    return frozenObject
  }

  public isObjectFixedToState(obj: any): boolean {
    return obj.state === this
  }

  /**
   * Adds a new object to the state.
   * - Assigns a UUID if missing.
   * - Tracks insertion in the change log.
   */
  public addObject<T extends EternalObject>(obj: T, reason: 'created' | 'imported' | 'versioned'): T {
    if (!obj || typeof obj !== "object") {
      throw new Error("Invalid object provided.")
    }
    if (!("uuid" in obj) || !obj.uuid) {
      throw new Error("Cannot add an object without a UUID.")
    }

    // Check if the object already exists in the state
    if (this.objectMap.has(obj.uuid) && (reason === 'created' || reason === 'imported')) {
      throw new Error(`Object with UUID ${obj.uuid} already exists in the state.`)
    }

    // Store the object in the state
    this.objectMap.set(obj.uuid, obj)

    // TODO check if needed changelog and timestamp for other reasons
    if (reason === 'created') {
      // add timestamp to object, to know the state it is created in
      obj.createdAt = this.timestamp

      // Track insertion in the change log
      this.changeLog.push({
        uuid: obj.uuid,
        objectType: obj.constructor.name, // Assuming dynamic classes
        change: "insert",
      })
    }
    return obj
  }

  /** Removes an object from THIS state (but does not affect history) */
  public removeObject(uuid: string): void {
    this.objectMap.delete(uuid)
  }

  /**
   * Deletes an object from the state.
   * - Removes all references to the object.
   * - Ensures bidirectional relationships are updated.
   * - Tracks the deletion in the change log.
   */
  public deleteObject(uuid: string): void {
    const object = this.objectMap.get(uuid)
    if (!object) {
      console.warn(`Attempted to delete non-existent object: ${uuid}`)
      return
    }

    // Track deletion in the change log
    this.changeLog.push({
      uuid,
      objectType: object.constructor.name, // Assuming dynamic classes are used
      change: "delete",
    })

    // Remove references from other objects
    for (const [key, value] of Object.entries(object)) {
      if (value instanceof Set) {
        value.forEach((item: any) => {
          if (item && typeof item === "object" && "uuid" in item) {
            item[key]?.delete(object)
          }
        })
      } else if (value instanceof Map) {
        value.forEach((item: any) => {
          if (item && typeof item === "object" && "uuid" in item) {
            item[key]?.delete(uuid)
          }
        })
      } else if (Array.isArray(value)) {
        object[key] = value.filter((item: any) => item.uuid !== uuid)
      }
    }

    // Remove the object itself
    this.objectMap.delete(uuid)
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
  public trackChange(entry: ChangeLogEntry) {
    this.changeLog.push(entry)
  }

  public getChangeLog(): ChangeLogEntry[] {
    return this.changeLog
  }
}
