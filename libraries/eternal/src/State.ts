import { ChangeLogEntry, hasChanges } from "./ChangeLog"
import { EternalStore } from "./EternalStore"
import { EternalObject } from "./handlers/InternalTypes"
import { shallowCopyWithObservables } from "./utils"

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
    this.timestamp = Date.now() // Assign a unique timestamp for each state
    this.store = new WeakRef(store)
    this.index = previousState ? previousState.index + 1 : 0
    this.objectMap = new Map(previousState ? previousState.objectMap : [])
  }
  private copyProperties(target: any, source: any) {
    // Copy own properties
    Object.getOwnPropertyNames(source).forEach((key) => {
      target[key] = source[key];
    });
  
    // Get the prototype of the source object
    const proto = Object.getPrototypeOf(source);
  
    // If the prototype is not null, recursively copy properties from the prototype
    if (proto !== null) {
      this.copyProperties(target, proto);
    }
  }

  // Create a new object version
  public createNewVersion<T extends EternalObject>(obj: T, trackForNotification = true): T {
    // Ensure we get the latest version of the object in this state
    // TODO: Check if the object is already fixed to this state
    //let newObj = this.getObject<T>(obj.uuid) || obj
    let newObj =  obj

    if (this.isObjectFixed(newObj)) {
      throw new Error(`Cannot make a new version from a fixed object that has UUID: "${obj.uuid}"`)
    }

    // Ensure we check both timestamp and actual modifications
    if (newObj.createdAt < this.timestamp) {
      // || hasChanges(this.changeLog, obj.uuid, )

       // newInstance.uuid = obj.uuid // Copy UUID
      const newInstance:EternalObject = shallowCopyWithObservables(newObj)
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

    return newObj
  }
  // Track an object for versioning
  public trackVersionedObject(obj: EternalObject): void {
    this.store?.deref()?.trackVersionedObject(obj)
  }

  /** Retrieves an object from this specific state (returns a fixed-state object) */
  public getObject<T>(uuid: string, fixed = false): T | undefined {
    const obj = this.getDynamicObject<T>(uuid)
    if (!obj) return undefined
    // If fixed state is requested, return a fixed object
    if (fixed) {
      return this.createFixedStateObject(obj)
    }
    // if is in update mode, return dynamic object
    if (this.store?.deref()?.isInUpdateMode()) {
      return obj
    }
    else {
      // Return a fixed object
      return this.createFixedStateObject(obj)
    }
  }

  /** Retrieves an object without fixing it to a state (used by Store) */
  public getDynamicObject<T>(uuid: string): T | undefined {
    const object = this.objectMap.get(uuid)
    // Ensure the object is not from a future state
    if (object.createdAt > this.timestamp) {
      throw new Error(`Cannot access object ${uuid} from a future state.`)
    }
    return object // Returns the object without fixing it
  }

  private createFixedStateObject<T>(obj: T): T {
    if (!obj || typeof obj !== "object") return obj

    // Create a new object that retains the original prototype
    const fixedObject = Object.create(Object.getPrototypeOf(obj))

    // Copy all properties from the original object
    Object.assign(fixedObject, obj)

    // Attach a fixed state reference
    Object.defineProperty(fixedObject, "state", {
      value: this,
      writable: false, // Ensure it cannot be changed
      enumerable: false, // Hide it from object iteration
    })

    return fixedObject
  }

  public isObjectFixedToState(obj: any): boolean {
    return obj.state === this
  }
  public isObjectFixed(obj: any): boolean {
    return obj.state !== undefined
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

    // TODO check if needed changelog for other reasons
    // Track insertion in the change log
    if (reason === 'created') {
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

  // Check if an object is old in this state
  public isFromOldState(obj: EternalObject): boolean {
    // If object's timestamp is older than the current state, it's frozen.
    return obj.createdAt < this.timestamp
  }

  public isCreatedInState(obj: EternalObject): boolean {
    // If object's timestamp is older than the current state, it's frozen.
    return obj.createdAt === this.timestamp
  }

  // Track changed objects
  public trackChange(entry: ChangeLogEntry) {
    this.changeLog.push(entry)
  }

  public getChangeLog(): ChangeLogEntry[] {
    return this.changeLog
  }
}
