import { ChangeLogEntry, consolidateChangeLogs, generateJsonPatch, hasChanges, JSONPatchOperation } from "./ChangeLog"
import { addPropertyAccessors } from "./PropertyAccessors"
import { createObservableEntityArray } from "./handlers/ArrayHandlers"
import { InternalObjectProps } from "./handlers/InternalTypes"
import { createObservableEntityMap, createObservableEntitySet } from "./handlers/MapSetHandlers"
import { TypeMeta } from "./handlers/MetaDefinitions"
import { State } from "./State"
import { SubscriptionManager } from "./SubscriptionManager";
import { randomUUID } from 'crypto';
import { EntryType } from "perf_hooks"

export type InternalRecipe = (obj: InternalObjectProps) => void

export class EternalStore {
  private stateHistory: State[] = [] // Stores the history of states
  private subscriptionManager = new SubscriptionManager(); // Create a subscription manager
  private currentStateIndex: number // Track active state index
  private inProduceMode: boolean = false // Flag to indicate if the store is in produce mode
  private typeToClassMap: Map<string, any> = new Map() // Maps type names to dynamic classes
  private fetchFromExternalSource?: (type: string, uuid: string) => any // Function to fetch objects from external sources
  private accessedObjects: Set<InternalObjectProps> = new Set(); // Track accessed object
  private versionedObjects: InternalObjectProps[] = []; // Track versioned objects


  constructor(metaInfo: Map<string, TypeMeta>, fetchFromExternalSource?: (type: string, uuid: string) => any) {
    this.fetchFromExternalSource = fetchFromExternalSource
    // Create dynamic classes for each type
    for (const [type, typeMeta] of metaInfo.entries()) {
      this.typeToClassMap.set(type, this.createDynamicClass(typeMeta,this))
    }
    // Initialize first state
    this.stateHistory.push(new State(this))
    this.currentStateIndex = 0
  }

  /** Returns the latest (i.e. current) state */
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


  /** Produces a new state with modifications */
  public produce<T extends object>(recipe: InternalRecipe, obj:T): T {
    if (this.inProduceMode) {
      throw new Error("Nested produce() calls are not allowed.")
    }
    this.inProduceMode = true
    this.accessedObjects.clear(); // Start tracking 
    this.versionedObjects = []; // Reset list at start
    this.makeNewState()
    const currentState = this.getState()

    // Use State's method to create a new object version
    let newObj = obj as InternalObjectProps


    try {
      recipe(newObj) // Apply modifications
      // 
      const additionalVersionedObjects = this.markVersionedObjects();
      this.versionedObjects.push(...additionalVersionedObjects);

      if (this.versionedObjects.length > 0) {
        this.subscriptionManager.notifySubscribers(this.versionedObjects); // Notify all updated objects

        // ✅ If `obj` itself was versioned, return the latest version
        const updatedObj = this.versionedObjects.find(o => o.uuid === newObj.uuid);
        if (updatedObj) {
            newObj = updatedObj;
        }
    }
    } finally {
      this.inProduceMode = false
      this.accessedObjects.clear(); // Stop tracking
    }
  
    return newObj as T
  }

  // Track changed objects
  public trackVersionedObject(obj: InternalObjectProps): void {
    if (!this.versionedObjects.includes(obj)) {
        this.versionedObjects.push(obj);
    }
}
  private markVersionedObjects(): InternalObjectProps[] {
    const versionedObjects: InternalObjectProps[] = [];

    for (const obj of this.accessedObjects) {
        if (hasChanges( this.getChangeLog(), obj["uuid"])) {
            const newVersion = this.getState().createNewVersion(obj);
            versionedObjects.push(newVersion);
        }
    }

    return versionedObjects;
}


public trackAccess(obj: InternalObjectProps): void {
    if (this.inProduceMode) {
        this.accessedObjects.add(obj);
    }
}

  /** Creates a dynamic class for a given type */
  private createDynamicClass(typeMeta: TypeMeta, store: EternalStore) {
    const state = this.getState() // Get the current state

    const className = typeMeta.name; // Use the type name as the class name

    const DynamicEntity = {
      [className]: class {
        public uuid!: string
        public createdAt!: number
        [key: string]: any

        constructor() {
          const currentMode = store.inProduceMode;

          // Generate unique values for each instance
          this.uuid = randomUUID()
          this.createdAt = Date.now()

          // Initialize properties based on type
          for (const [key, propertyMeta] of typeMeta.properties) {
            const privateKey = `_${key}`

            this[privateKey] =
              propertyMeta.type === "set"
                ? createObservableEntitySet(new Set(), state, typeMeta.properties)
                : propertyMeta.type === "array"
                ? createObservableEntityArray([], state, typeMeta.properties)
                : propertyMeta.type === "map"
                ? createObservableEntityMap(new Map(), state, typeMeta.properties)
                : undefined
          }
        }
      }
    }[className];

    // Property accessors (shared across instances) will handle access logic
    addPropertyAccessors(DynamicEntity.prototype, typeMeta, this)

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
