import {
  ChangeLogEntry,
  consolidateChangeLogs,
  generateJsonPatch,
  hasChanges,
  JSONPatchOperation,
} from "../events/ChangeLog"
import { addCopyPropsMethod, addPropertyAccessors } from "./PropertyAccessors"
import { createImmutableArray } from "../handlers/ArrayHandlers"
import { __StoreSuperClass__, createdAt, StoreObject, uuid } from "../handlers/InternalTypes"
import { createImmutableMap } from "../handlers/MapHandlers"
import { createImmutableSet } from "../handlers/SetHandlers"
import { TypeMeta } from "../meta/InternalSchema"
import { State } from "./State"
import { SubscriptionManager } from "../events/SubscriptionManager"
import { randomUUID } from "crypto"
import { makePrivatePropertyKey, makePrivateProxyKey } from "./utils"
import { isSimplePropType } from "../meta/PropertyDefinitions"

export type InternalRecipe = ((obj: StoreObject) => void) | (() => any)

export class StoreClass {
  private stateHistory: State[] = [] // Stores the history of states
  private subscriptionManager = new SubscriptionManager(this) // Create a subscription manager
  private currentStateIndex: number = -1 // Track active state index
  private inUpdateMode: boolean = false // Flag to indicate if the store is in update mode
  private typeToClassMap: Map<string, any> = new Map() // Maps type names to dynamic classes

  private accessedObjects: Set<StoreObject> = new Set() // Track accessed object
  private versionedObjects: StoreObject[] = [] // Track versioned objects

  private metaInfo: Map<string, TypeMeta>

  constructor(metaInfo: Map<string, TypeMeta>) {
    this.metaInfo = metaInfo
    // Create dynamic classes for each type
    for (const [type, typeMeta] of metaInfo) {
      if (!this.typeToClassMap.has(type)) {
        this.createDynamicClass(typeMeta, this)
      }
    }
  }

  public getMeta(type: string): TypeMeta {
    return this.typeToClassMap.get(type)
  }

  public getSubscriptionManager(): SubscriptionManager {
    return this.subscriptionManager
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
    // TODO check if objects from previous state which has nextVersion objects will be hanging
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1)
    }
    this.stateHistory.push(new State(this, this.stateHistory.length > 0 ? this.getState() : undefined))
    this.currentStateIndex++
  }

  private revertToPreviousState(): boolean {
    if (this.currentStateIndex >= 0) {
      this.currentStateIndex--
      return true // successful
    }
    return false // unsuccessful
  }
  /** Undo the last change */
  public undo(): boolean {
    if (this.inUpdateMode) {
      throw new Error("Cannot undo while in update mode.")
    }
    return this.revertToPreviousState()
  }

  /** Redo the last undone change */
  public redo(): boolean {
    if (this.inUpdateMode) {
      throw new Error("Cannot redo while in update mode.")
    }
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      this.currentStateIndex++
      return true // Redo successful
    }
    return false // Cannot redo beyond latest state
  }

  /** Creates a new object of a specified type and initializes it with the given state. */
  public createObject<T>(type: string, initialState: Partial<T> = {}, processed: Map<any, any> = new Map()): T {
    if (!this.typeToClassMap.has(type)) {
      throw new Error(`Unknown type: ${type}. Cannot create object.`)
    }

    const wasInUpdateMode = this.inUpdateMode // Check if the store is already in update mode

    try {
      if (!wasInUpdateMode) {
        this.inUpdateMode = true // Enter update mode if not already in it
        this.makeNewState() // Create a new state for the transaction
      }

      const DynamicClass = this.typeToClassMap.get(type)
      if (!DynamicClass) {
        throw new Error(`No constructor found for type: ${type}. Cannot create object.`)
      }
      const newObject = new DynamicClass()

      // Generate unique values for each instance
      newObject[uuid] = randomUUID()
      newObject[createdAt] = this.getState().timestamp

      // Add the new object to the processed map to prevent infinite recursion
      processed.set(initialState, newObject)

      // Retrieve type metadata
      const typeMeta = this.metaInfo.get(type)
      if (!typeMeta) {
        throw new Error(`Metadata for type ${type} not found.`)
      }

      // Initialize properties based on metadata
      for (const [propName, propMeta] of typeMeta.properties) {
        let initialValue = initialState ? (initialState as any)[propName] : undefined

        // If the initial value is undefined, use the default value as the initial value
        if (initialValue === undefined && propMeta.defaultValue !== undefined) {
          initialValue = propMeta.defaultValue
        }

        // Skip if the initial value is null or undefined
        if (initialValue === null || initialValue === undefined) {
          continue
        }

        // Handle property initialization based on its type
        switch (propMeta.type) {
          case "array":
            if (!Array.isArray(initialValue)) {
              throw new Error(`Expected an array for property ${propName}, but got ${typeof initialValue}.`)
            }
            const targetArray = newObject[propName]
            if (!Array.isArray(targetArray)) {
              throw new Error(`Property ${propName} is not initialized as an array.`)
            }
            for (const item of initialValue) {
              targetArray.push(this.ensureStoreObject(item, propMeta.domainType, processed))
            }
            break

          case "map":
            if (!(initialValue instanceof Map)) {
              throw new Error(`Expected a Map for property ${propName}, but got ${typeof initialValue}.`)
            }
            const targetMap = newObject[propName]
            if (!(targetMap instanceof Map)) {
              throw new Error(`Property ${propName} is not initialized as a Map.`)
            }
            for (const [mapKey, mapValue] of initialValue.entries()) {
              targetMap.set(mapKey, this.ensureStoreObject(mapValue, propMeta.domainType, processed))
            }
            break

          case "set":
            if (!(initialValue instanceof Set)) {
              throw new Error(`Expected a Set for property ${propName}, but got ${typeof initialValue}.`)
            }
            const targetSet = newObject[propName]
            if (!(targetSet instanceof Set)) {
              throw new Error(`Property ${propName} is not initialized as a Set.`)
            }
            for (const setValue of initialValue) {
              targetSet.add(this.ensureStoreObject(setValue, propMeta.domainType, processed))
            }
            break

          case "object":
            newObject[propName] = this.ensureStoreObject(initialValue, propMeta.domainType, processed)
            break

          default:
            // Handle primitive types
            newObject[propName] = initialValue
            break
        }
      }

      // Immediately add to the latest state
      this.getState().addObject(newObject, "created")

      return newObject
    } catch (error) {
      console.error("An error occurred while creating the object:", error)
      if (!wasInUpdateMode) {
        this.revertToPreviousState() // Revert the state if this method started the transaction
      }
      throw error // Re-throw the error after logging and reverting
    } finally {
      if (!wasInUpdateMode) {
        this.inUpdateMode = false // Exit update mode if it was set by this method
      }
    }
  }

  /**
   * Ensures that a value is either an object from the store or creates a new one if necessary.
   * Prevents infinite recursion by using a processed map.
   * @param value - The value to ensure is a store object.
   * @param type - The type of the object to create if necessary.
   * @param processed - A map of already processed values to their corresponding store objects.
   */
  private ensureStoreObject(value: any, type?: string, processed: Map<any, any> = new Map()): any {
    if (processed.has(value)) {
      // Return the already processed object to prevent infinite recursion
      return processed.get(value)
    }

    if (value instanceof __StoreSuperClass__) {
      // If the value is already a store object, return it directly
      return value
    } else if (typeof value === "object" && value !== null) {
      // If the value is a plain object, create a new store object
      if (!type) {
        throw new Error("Type information is required to create a new object.")
      }
      if (!this.typeToClassMap.has(type)) {
        throw new Error(`Unknown type: ${type}. Cannot create object.`)
      }
      return this.createObject(type, value, processed)
    } else if (isSimplePropType(type)) {
      // If the type is a simple property type, return the value directly
      return value
    } else {
      throw new Error(`Invalid value '${value}' for type '${type}'.`)
    }
  }

  public toImmutable<T extends object>(obj: T, type?: string, processed = new Map<any, any>()): T {
    const wasInUpdateMode = this.inUpdateMode // Check if the store is already in update mode
    try {
      // Check if update mode is already active
      if (!wasInUpdateMode) {
        this.inUpdateMode = true // Enter update mode if not already in it
        this.makeNewState() // Create a new state for the transaction
      }

      // Check if the object is already a store object
      if (obj instanceof __StoreSuperClass__) {
        return obj // If already a store object, return it
      }

      // Check for cyclic structures
      if (processed.has(obj)) {
        return processed.get(obj) // Return the previously processed object
      }

      //  Determine the type
      const typeName = (obj as any)["@AelasticsType"] || type // Use the special property or the optional argument
      if (!typeName) {
        throw new Error(
          `The provided object does not have a valid '@AelasticsType' property, and no type argument was provided.`
        )
      }

      // Retrieve metadata
      const typeMeta = this.metaInfo.get(typeName)
      if (!typeMeta) {
        throw new Error(`Unknown type: ${typeName}. Cannot import object.`)
      }

      // Retrieve the UUID from the provided object
      const uuidValue = (obj as any)["@AelasticsUUID"]
      if (!uuidValue) {
        throw new Error(`The provided object does not have a valid UUID.`)
      }

      // Check if the object with this UUID already exists in the store
      const exObj = this.getState().getObject(uuidValue)
      if (exObj) {
        return exObj as T // Return the existing object from the store
      }

      // Step 8: Create a new instance of the store object using the type
      const DynamicClass = this.typeToClassMap.get(typeName)
      if (!DynamicClass) {
        throw new Error(`No constructor found for type: ${typeName}. Cannot create object.`)
      }
      const newObject = new DynamicClass()
      // Add the object to the processed map to handle cyclic references
      processed.set(obj, newObject)

      // Initialize properties
      for (const [propName, propMeta] of typeMeta.properties) {
        const value = (obj as any)[propName] // Get the value from the input object

        if (value === undefined) {
          continue // Skip undefined properties
        }

        // Step 11: Handle collections and nested objects
        const privateKey = makePrivatePropertyKey(propName) // Get the private property name

        if (propMeta.type === "array") {
          value.forEach((item: any) => {
            const itemType = item["@AelasticsType"] || propMeta.domainType // Use the special property or fallback to metadata
            ;(newObject as any)[privateKey].push(this.toImmutable(item, itemType, processed))
          })
        } else if (propMeta.type === "map") {
          value.forEach((val: any, key: any) => {
            const valType = val["@AelasticsType"] || propMeta.domainType // Use the special property or fallback to metadata
            ;(newObject as any)[privateKey].set(key, this.toImmutable(val, valType, processed))
          })
        } else if (propMeta.type === "set") {
          value.forEach((item: any) => {
            const itemType = item["@AelasticsType"] || propMeta.domainType // Use the special property or fallback to metadata
            ;(newObject as any)[privateKey].add(this.toImmutable(item, itemType, processed))
          })
        } else if (propMeta.type === "object") {
          const objectType = value["@AelasticsType"] || propMeta.domainType // Use the special property or fallback to metadata
          ;(newObject as any)[privateKey] = this.toImmutable(value, objectType, processed)
        } else {
          // Simple property
          ;(newObject as any)[privateKey] = value
        }
      }

      // Copy UUID and other internal properties using symbols
      ;(newObject as any)[uuid] = uuidValue // Use the UUID from the input object
      ;(newObject as any)[createdAt] = (obj as any)["@AelasticsCreatedAtSymbol"] // Use the original creation timestamp

      // dd the object to the store
      this.getState().addObject(newObject, "imported")

      // Return the immutable object
      return newObject
    } catch (error) {
      // Handle errors and revert the state if necessary
      if (!wasInUpdateMode) {
        this.revertToPreviousState() // Revert the state if this method started the transaction
      }
      throw error // Rethrow the error
    } finally {
      // if it was started by this method
      if (!wasInUpdateMode) {
        this.inUpdateMode = false // Exit update mode if it was set by this method
      }
    }
  }

  /** Retrieves an object dynamically from the latest state */
  public findObjectByUUID<T>(uuid: string): T | undefined {
    return this.getState().getDynamicObject(uuid)
  }

  /** Returns an object fixed to a specific state */
  public fromState<T>(stateIndex: number, target: string | T): T | undefined {
    const state = this.getStateByIndex(stateIndex)
    if (!state) {
      throw new Error(`State at index ${stateIndex} does not exist.`)
    }
    // If target is a UUID string
    if (typeof target === "string") {
      return state.getObject(target, true)
    }
    // If target is an object with a UUID
    if (target instanceof __StoreSuperClass__) {
      return state.getObject(target[uuid], true)
    }
    // If target is not a string or object with a UUID
    throw new Error("Invalid target object: it must be an object from the store.")
  }

  /** Retrieves a specific historical state */
  public getStateByIndex(index: number): State {
    if (index < 0 || index >= this.stateHistory.length) {
      throw new Error(`State at index ${index} does not exist.`)
    }
    return this.stateHistory[index]
  }

  /** Produces a new state with modifications */
  public produce<T>(recipe: (obj: T) => void, obj?: T): T {
    if (this.inUpdateMode) {
      throw new Error("Nested produce() calls are not allowed.")
    }
    this.inUpdateMode = true
    this.accessedObjects.clear() // Start tracking
    this.versionedObjects = [] // Reset list at start
    this.makeNewState()

    if (obj) {
      if (!(obj instanceof __StoreSuperClass__)) {
        throw new Error("The provided object is not created or .")
      }
      // Versioning logic when an object is passed
      // Use State's method to create a new object version
      let newObj = obj as StoreObject
      try {
        recipe(newObj as T) // Apply modifications
        // Track changed objects
        const additionalVersionedObjects = this.markVersionedObjects()
        this.versionedObjects.push(...additionalVersionedObjects)

        if (this.versionedObjects.length > 0) {
          this.subscriptionManager.notifyObjectSubscribers(/*this.versionedObjects*/) // Notify all updated objects

          // If `obj` itself was versioned, return the latest version
          const updatedObj = this.versionedObjects.find((o) => o[uuid] === newObj[uuid])
          if (updatedObj) {
            newObj = updatedObj
          }
        }
      } catch (error) {
        console.error("An error occurred while applying the recipe:", error)
        this.revertToPreviousState()
        throw error // Re-throw the error after logging it
      } finally {
        this.inUpdateMode = false
        this.accessedObjects.clear() // Stop tracking
      }
      return newObj as T
    } else {
      try {
        const result = (recipe as () => T)() // Capture return value
        this.markVersionedObjects()
        this.subscriptionManager.notifyObjectSubscribers(/*this.versionedObjects*/) // Notify global changes
        return result // Return the result from recipe()
      } finally {
        this.inUpdateMode = false
        this.accessedObjects.clear() // Stop tracking
      }
    }
  }

  // Track changed objects
  public trackVersionedObject(obj: StoreObject): void {
    if (!this.versionedObjects.includes(obj)) {
      this.versionedObjects.push(obj)
    }
  }
  private markVersionedObjects(): StoreObject[] {
    const versionedObjects: StoreObject[] = []

    for (const obj of this.accessedObjects) {
      if (hasChanges(this.getChangeLog(), obj["uuid"])) {
        const newVersion = this.getState().createNewVersion(obj)
        versionedObjects.push(newVersion)
      }
    }

    return versionedObjects
  }

  public trackAccess(obj: StoreObject): void {
    if (this.inUpdateMode) {
      this.accessedObjects.add(obj)
    }
  }

  private createDynamicClass(typeMeta: TypeMeta, store: StoreClass) {
    const className = typeMeta.qName // Use the type name as the class name
    // TODO: support creation of subclasses recursively, so that order is not important

    const superClass = typeMeta.extends ? this.getClassByName(typeMeta.extends) : undefined
    let BaseClass: any
    BaseClass = superClass
      ? superClass
      : typeMeta.extends
      ? this.createDynamicClass(this.metaInfo.get(typeMeta.extends)!, store)
      : __StoreSuperClass__
    const DynamicClass = {
      [className]: class extends BaseClass {
        constructor() {
          super() // Call the constructor of the superclass
          // Initialize properties based on type
          for (const [key, propertyMeta] of typeMeta.properties) {
            const privateKey = makePrivatePropertyKey(key)
            const proxyKey = makePrivateProxyKey(key)
            // Initialize the property based on type
            switch (propertyMeta.type) {
              case "array":
                this[privateKey] = []
                this[proxyKey] = createImmutableArray(this[privateKey], {
                  store,
                  object: this as any,
                  propDes: propertyMeta,
                })
                break

              case "map":
                this[privateKey] = new Map()
                this[proxyKey] = createImmutableMap(this[privateKey], {
                  store,
                  object: this as any,
                  propDes: propertyMeta,
                })
                break

              case "set":
                this[privateKey] = new Set()
                this[proxyKey] = createImmutableSet(this[privateKey], {
                  store,
                  object: this as any,
                  propDes: propertyMeta,
                })
                break

              case "string":
                this[privateKey] = propertyMeta.defaultValue //|| ""
                break

              case "number":
                this[privateKey] = propertyMeta.defaultValue //|| 0
                break

              case "boolean":
                this[privateKey] = propertyMeta.defaultValue //|| false
                break

              case "object":
                this[privateKey] = undefined
                break

              default:
                this[privateKey] = undefined
                break
            }
          }
        }
      },
    }[className]

    // Property accessors (shared across instances) will handle access logic
    addPropertyAccessors(DynamicClass.prototype, typeMeta, store)
    // Add the copyProps method to the prototype
    addCopyPropsMethod(DynamicClass.prototype, typeMeta)
    // Store the class in the map
    this.typeToClassMap.set(className, DynamicClass)
    return DynamicClass
  }

  /** Returns the dynamic class for a given type name */
  public getClassByName(type: string): any {
    return this.typeToClassMap.get(type)
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
