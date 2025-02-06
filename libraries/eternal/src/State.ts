import { ChangeLogEntry } from "./ChangeLog"
import { Store } from "./Store"

/** Read-only interface for accessing immutable objects in a specific state */
interface StateView {
  getObject<T>(uuid: string): T | undefined
  index: number
}

export class State implements StateView {
  public readonly timestamp: number // Track when this state was created
  private inProduceMode: boolean = false // Flag to indicate if the state is in produce mode
  private objectMap: Map<string, any> // Maps UUIDs to objects
  private previousState?: State // Reference to the previous state
  private store: WeakRef<Store> // Reference to the store that owns this state
  public index: number // Index of this state in the store's history
  private changeLog: ChangeLogEntry[] = [] // Stores tracked changes

  constructor(store: Store, previousState?: State) {
    this.timestamp = Date.now() // Assign a unique timestamp for each state
    this.store = new WeakRef(store)
    this.previousState = previousState
    this.index = previousState ? previousState.index + 1 : 0
    this.objectMap = new Map(previousState ? previousState.objectMap : [])
  }
  public enterProduceMode() {
    this.inProduceMode = true
  }

  public exitProduceMode() {
    this.inProduceMode = false
  }

  public isInProduceMode(): boolean {
    return this.inProduceMode
  }

  /** Retrieves an object from this specific state (returns a fixed-state object) */
  public getObject<T>(uuid: string): T | undefined {
    const obj = this.getDynamicObject<T>(uuid)
    if (!obj) return undefined
    // Return a shallow copy with a reference to this fixed state
    return this.createFixedStateObject(obj)
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

  /**
   * Adds a new object to the state.
   * - Assigns a UUID if missing.
   * - Tracks insertion in the change log.
   */
  public addObject<T extends { uuid: string }>(obj: T): T {
    if (!obj || typeof obj !== "object") {
      throw new Error("Invalid object provided.")
    }
    if (!("uuid" in obj) || !obj.uuid) {
      throw new Error("Cannot add an object without a UUID.");
  }
    if (this.objectMap.has(obj.uuid)) {
      throw new Error(`Object with UUID ${obj.uuid} already exists in the state.`)
    }

    // Store the object in the state
    this.objectMap.set(obj.uuid, obj)

    // Track insertion in the change log
    this.changeLog.push({
      uuid: obj.uuid,
      objectType: obj.constructor.name, // Assuming dynamic classes
      change: "insert",
    })

    return obj
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
  public trackChange(entry: ChangeLogEntry) {
    this.changeLog.push(entry)
  }

  public getChangeLog(): ChangeLogEntry[] {
    return this.changeLog
  }
}
