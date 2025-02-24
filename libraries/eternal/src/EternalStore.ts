import { ChangeLogEntry, consolidateChangeLogs, generateJsonPatch, hasChanges, JSONPatchOperation } from "./ChangeLog"
import { addCloneMethod, addPropertyAccessors } from "./PropertyAccessors"
import { createObservableEntityArray } from "./handlers/ArrayHandlers"
import { EternalObject } from "./handlers/InternalTypes"
import { createObservableEntityMap, createObservableEntitySet } from "./handlers/MapSetHandlers"
import { TypeMeta } from "./handlers/MetaDefinitions"
import { State } from "./State"
import { SubscriptionManager } from "./SubscriptionManager";
import { randomUUID } from 'crypto';
import { makePrivatePropertyKey, makePrivateProxyKey } from "./utils"

export type InternalRecipe = ((obj: EternalObject) => void) | (() => any)

export class EternalStore {
  private stateHistory: State[] = [] // Stores the history of states
  private subscriptionManager = new SubscriptionManager(); // Create a subscription manager
  private currentStateIndex: number = -1// Track active state index
  private inUpdateMode: boolean = false // Flag to indicate if the store is in update mode
  private typeToClassMap: Map<string, any> = new Map() // Maps type names to dynamic classes



  // TODO Remove fetchFromExternalSource
  private accessedObjects: Set<EternalObject> = new Set(); // Track accessed object
  private versionedObjects: EternalObject[] = []; // Track versioned objects


  private metaInfo: Map<string, TypeMeta>;

  constructor(metaInfo: Map<string, TypeMeta>) {
    this.metaInfo = metaInfo;
    // Create dynamic classes for each type
    for (const [type, typeMeta] of metaInfo.entries()) {
      if (!this.typeToClassMap.has(type)) {
        this.createDynamicClass(typeMeta, this)
      }
    }
  }

  public getMeta(type: string): TypeMeta {
    return this.typeToClassMap.get(type)
  }

  /** Returns the latest (i.e. current) state */
  public getState(): State {
    if (this.stateHistory.length === 0) {
      // Initialize first state
      this.stateHistory.push(new State(this))
      this.currentStateIndex = 0
    }
    return this.stateHistory[this.currentStateIndex]
  }

  /** Checks if store is in update mode */
  public isInUpdateMode(): boolean {
    return this.inUpdateMode
  }

  /** Creates a new state before entering update mode */
  // TODO return private after testing
  public makeNewState(): void {
    // Clear future states if undo() was called before this change
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1)
    }
    this.stateHistory.push(new State(this, this.stateHistory.length > 0 ? this.getState() : undefined))
    this.currentStateIndex++
  }

  /** Undo the last change */
  public undo(): boolean {
    // TODO: check if is in update mode
    if (this.currentStateIndex > 0) {
      this.currentStateIndex--
      return true // Undo successful
    }
    return false // Cannot undo beyond initial state
  }

  /** Redo the last undone change */
  public redo(): boolean {
    // TODO: check if is in update mode
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      this.currentStateIndex++
      return true // Redo successful
    }
    return false // Cannot redo beyond latest state
  }

  /** Creates an empty object of a given type */
  public createObject<T>(type: string): T {
    // TODO: check if is in update mode
    if (!this.typeToClassMap.has(type)) {
      throw new Error(`Unknown type: ${type}. Cannot create object.`)
    }

    const DynamicClass = this.typeToClassMap.get(type)
    const newObject = new DynamicClass()
    // Generate unique values for each instance
    newObject.uuid = randomUUID();
    newObject.createdAt = Date.now(); // TODO check is this done by state

    // Immediately add to the latest state
    this.getState().addObject(newObject, 'created')

    return newObject
  }

  /** Retrieves an object dynamically from the latest state */
  public getObject<T>(uuid: string): T | undefined {
    return this.getState().getDynamicObject(uuid)
  }

  /** Returns an object fixed to a specific state */
  public fromState<T>(stateIndex: number, target: string | T): T | undefined {
    const state = this.getStateByIndex(stateIndex)
    if (!state) {
      throw new Error(`State at index ${stateIndex} does not exist.`);
    }
    // If target is a UUID string
    if (typeof target === "string") {
      return state.getObject(target, true)
    }
    // If target is an object with a UUID
    if (target && typeof target === "object" && "uuid" in target) {
      return state.getObject((target as { uuid: string }).uuid, true)
    }
    // If target is not a string or object with a UUID
    throw new Error("Invalid target object.")
  }

  /** Retrieves a specific historical state */
  public getStateByIndex(index: number): State {
    if (index < 0 || index >= this.stateHistory.length) {
      throw new Error(`State at index ${index} does not exist.`);
    }
    return this.stateHistory[index]
  }


  /** Produces a new state with modifications */
  public produce<T extends object>(recipe: InternalRecipe, obj?: T): T | void {
    if (this.inUpdateMode) {
      throw new Error("Nested produce() calls are not allowed.")
    }
    this.inUpdateMode = true
    this.accessedObjects.clear(); // Start tracking 
    this.versionedObjects = []; // Reset list at start
    this.makeNewState()
    const currentState = this.getState()

    if (obj) {  // Versioning logic when an object is passed
      // Use State's method to create a new object version
      let newObj = obj as EternalObject
      try {
        recipe(newObj) // Apply modifications
        // Track changed objects
        const additionalVersionedObjects = this.markVersionedObjects();
        this.versionedObjects.push(...additionalVersionedObjects);

        if (this.versionedObjects.length > 0) {
          this.subscriptionManager.notifySubscribers(this.versionedObjects); // Notify all updated objects

          // If `obj` itself was versioned, return the latest version
          const updatedObj = this.versionedObjects.find(o => o.uuid === newObj.uuid);
          if (updatedObj) {
            newObj = updatedObj;
          }
        }
      }
      // TODO: handle errors

      finally {
        this.inUpdateMode = false
        this.accessedObjects.clear(); // Stop tracking
      }
      return newObj as T
    }
    else {
      try {
        const result = (recipe as () => T)(); // Capture return value
        this.markVersionedObjects();
        this.subscriptionManager.notifySubscribers(this.versionedObjects); // Notify global changes
        return result; // Return the result from recipe()

      } finally {
        this.inUpdateMode = false
        this.accessedObjects.clear(); // Stop tracking
      }
    }
  }

  // Track changed objects
  public trackVersionedObject(obj: EternalObject): void {
    if (!this.versionedObjects.includes(obj)) {
      this.versionedObjects.push(obj);
    }
  }
  private markVersionedObjects(): EternalObject[] {
    const versionedObjects: EternalObject[] = [];

    for (const obj of this.accessedObjects) {
      if (hasChanges(this.getChangeLog(), obj["uuid"])) {
        const newVersion = this.getState().createNewVersion(obj);
        versionedObjects.push(newVersion);
      }
    }

    return versionedObjects;
  }


  public trackAccess(obj: EternalObject): void {
    if (this.inUpdateMode) {
      this.accessedObjects.add(obj);
    }
  }
  private createDynamicClass(typeMeta: TypeMeta, store: EternalStore) {
    const typeSchema = this.metaInfo;
    const className = typeMeta.name; // Use the type name as the class name
    const baseTypeMeta = typeMeta.name ? typeSchema.get(typeMeta.name) : undefined;
    const BaseClass: any = baseTypeMeta ? this.createDynamicClass(baseTypeMeta, store) : Object;

    const DynamicClass = {
      [className]: class extends BaseClass {
        public uuid!: string;
        public createdAt!: number;
        [key: string]: any;

        constructor() {
          super(); // Call the constructor of the superclass

          // Initialize properties based on type
          for (const [key, propertyMeta] of typeMeta.properties) {
            const privateKey = makePrivatePropertyKey(key);
            const proxyKey = makePrivateProxyKey(key);


            switch (propertyMeta.type) {
              case "array":
                this[privateKey] = [];
                this[proxyKey] = createObservableEntityArray(this[privateKey], true, { frozen: false });
                break;

              case "map":
                this[privateKey] = new Map();
                this[proxyKey] = createObservableEntityMap(this[privateKey], typeMeta.properties);
                break;

              case "set":
                this[privateKey] = new Set();
                this[proxyKey] = createObservableEntitySet(this[privateKey], typeMeta.properties);
                break;

              default:
                this[privateKey] = undefined;
                break;
            }
          }
        }
      }
    }[className];

    // Property accessors (shared across instances) will handle access logic
    addPropertyAccessors(DynamicClass.prototype, typeMeta, store);
    // Add a clone method to the class
    addCloneMethod(DynamicClass.prototype, typeMeta, store, typeSchema);
    // Store the class in the map
    this.typeToClassMap.set(className, DynamicClass)
    return DynamicClass;
  }

  

  /** Returns the dynamic class for a given type name */
  public getClassByName(type: string): any {
    return this.typeToClassMap.get(type);
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
