import { ChangeLogEntry, consolidateChangeLogs, generateJsonPatch, JSONPatchOperation } from "./ChangeLog"
import { addPropertyAccessors } from "./handlers/addPropertyAccessors"
import { createObservableEntityArray } from "./handlers/ArrayHandlers"
import { InternalObjectProps } from "./handlers/InternalTypes"
import { createObservableEntityMap, createObservableEntitySet } from "./handlers/MapSetHandlers"
import { TypeMeta } from "./handlers/MetaDefinitions"
import { State } from "./State"
import { generateUUID } from "./utils"

export class Store {
  private stateHistory: State[] = [] // Stores the history of states
  private currentStateIndex: number // Track active state index
  private inProduceMode: boolean = false // Flag to indicate if the store is in produce mode
  private typeToClassMap: Map<string, any> = new Map() // Maps type names to dynamic classes
  private fetchFromExternalSource?: (type: string, uuid: string) => any // Function to fetch objects from external sources
  private subscriptions = new WeakMap<object, Set<() => void>>() // Subscriptions for object changes

  constructor(metaInfo: Map<string, TypeMeta>, fetchFromExternalSource?: (type: string, uuid: string) => any) {
    this.fetchFromExternalSource = fetchFromExternalSource
    // Create dynamic classes for each type
    for (const [type, typeMeta] of metaInfo.entries()) {
      this.typeToClassMap.set(type, this.createDynamicClass(typeMeta))
    }
    // Initialize first state
    this.stateHistory.push(new State(this))
    this.currentStateIndex = 0
  }

  /** Returns the latest (i.e. cuurent) state */
  public getState(): State {
    return this.stateHistory[this.currentStateIndex]
  }

  /** Checks if store is in produce mode */
  public isInProduceMode(): boolean {
    return this.inProduceMode
  }

  /** Creates a new state when entering produce mode */
  private makeNewState(): void {
    // Clear future states if undo() was called before this change
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1)
    }
    this.stateHistory.push(new State(this, this.getState()))
    this.currentStateIndex++
  }

  /** Undo the last change */
  public undo(): boolean {
    if (this.currentStateIndex > 0) {
      this.currentStateIndex--
      return true // Undo successful
    }
    return false // Cannot undo beyond initial state
  }

  /** Redo the last undone change */
  public redo(): boolean {
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      this.currentStateIndex++
      return true // Redo successful
    }
    return false // Cannot redo beyond latest state
  }

  /** Creates an empty object of a given type */
  public createObject<T>(type: string): T {
    if (!this.typeToClassMap.has(type)) {
      throw new Error(`Unknown type: ${type}. Cannot create object.`)
    }

    const DynamicClass = this.typeToClassMap.get(type)
    const newObject = new DynamicClass()

    // Immediately add to the latest state
    this.getState().addObject(newObject)

    return newObject
  }

  /** Retrieves an object dynamically from the latest state */
  public getObject<T>(uuid: string): T | undefined {
    return this.getState().getDynamicObject(uuid)
  }

  /** Returns an object fixed to a specific state */
  public fromState<T>(stateIndex: number, target: string | T): T | undefined {
    const state = this.getStateByIndex(stateIndex)
    if (!state) return undefined

    if (typeof target === "string") {
      return state.getObject(target)
    }

    if (target && typeof target === "object" && "uuid" in target) {
      return state.getObject((target as { uuid: string }).uuid)
    }

    return undefined
  }

  /** Retrieves a specific historical state */
  public getStateByIndex(index: number): State | undefined {
    return this.stateHistory[index]
  }

  /** Subscribes a callback to changes in a specific object */
  public subscribe(obj: object, callback: () => void): void {
    if (!this.subscriptions.has(obj)) {
      this.subscriptions.set(obj, new Set())
    }
    this.subscriptions.get(obj)!.add(callback)
  }

  /** Unsubscribes a callback from an object */
  public unsubscribe(obj: object, callback: () => void): void {
    this.subscriptions.get(obj)?.delete(callback)
  }

  /** Notifies all subscribers when an object changes */
  private notifySubscribers(obj: object): void {
    if (this.subscriptions.has(obj)) {
      this.subscriptions.get(obj)!.forEach((callback) => callback())
    }
  }

  /** Produces a new state with modifications */
  public produce<T extends InternalObjectProps>(recipe: (obj: T) => void, obj: T): T {
    if (this.inProduceMode) {
      throw new Error("Nested produce() calls are not allowed.")
    }

    this.inProduceMode = true
    this.makeNewState()
    const currentState = this.getState()

    // Use State's method to create a new object version
    let newObj = currentState.createNewVersion(obj)


    try {
      recipe(newObj) // Apply modifications
      this.notifySubscribers(obj) // Notify subscribers of changes
    } finally {
      this.inProduceMode = false
    }
  
    return obj
  }

  /** Creates a dynamic class for a given type */
  private createDynamicClass(typeMeta: TypeMeta) {
    const state = this.getState() // Get the current state

    // Precompute template object before constructor
    const template: Record<string, any> = {}
    for (const [key, propertyMeta] of typeMeta.properties) {
      const privateKey = `_${key}`

      template[privateKey] =
        propertyMeta.type === "set"
          ? createObservableEntitySet(new Set(), state, typeMeta.properties)
          : propertyMeta.type === "array"
          ? createObservableEntityArray([], state, typeMeta.properties)
          : propertyMeta.type === "map"
          ? createObservableEntityMap(new Map(), state, typeMeta.properties)
          : undefined
    }

    class DynamicEntity {
      public uuid!: string

      constructor() {
        // Use template to initialize instance properties efficiently
        Object.assign(this, template)
      }
    }

    // Property accessors (shared across instances) will handle access logic
    addPropertyAccessors(DynamicEntity.prototype, typeMeta, this.getState())

    return DynamicEntity
  }

  public getChangeLog(): ChangeLogEntry[] {
    return this.getState().getChangeLog()
  }

  public getConsolidatedChangeLog(): ChangeLogEntry[] {
    return consolidateChangeLogs(this.stateHistory.map((state) => state.getChangeLog()))
  }

  public getJsonPatch(): JSONPatchOperation[] {
    return generateJsonPatch(this.getConsolidatedChangeLog())
  }
}
