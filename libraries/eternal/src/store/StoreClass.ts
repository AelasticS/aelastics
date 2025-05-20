/**
 * The `StoreClass` is a core class that implements the functionality for managing objects
 *  in a dynamic and immutable store.
 *
 * It supports features such as state history, undo/redo operations, dynamic class creation, and
 * object versioning. The class is designed to handle complex object structures with support for
 * arrays, maps, sets, and nested objects, while ensuring immutability and tracking changes.
 *
 * ### Key Features:
 * - **State Management**: Maintains a history of states with undo/redo capabilities.
 * - **Dynamic Class Creation**: Dynamically generates classes based on metadata.
 * - **Object Versioning**: Tracks changes to objects and creates new versions when necessary.
 * - **Subscription Management**: Notifies subscribers of changes to objects or the store.
 * - **Immutable Object Handling**: Converts objects to and from immutable representations.
 * - **Change Tracking**: Tracks accessed and modified objects for efficient updates.
 * */

import { ChangeLogEntry, consolidateChangeLogs, generateJsonPatch, JSONPatchOperation } from "../events/ChangeLog"
import { addCopyPropsMethod, addPropertyAccessors } from "./PropertyAccessors"
import { createImmutableArray } from "../handlers/ArrayHandlers"
import { __StoreSuperClass__, createdAt, nextVersion, StoreObject, uuid } from "./InternalTypes"
import { createImmutableMap } from "../handlers/MapHandlers"
import { createImmutableSet } from "../handlers/SetHandlers"
import { PropertyMeta, TypeMeta } from "../meta/InternalSchema"
import { State } from "./State"
import { SubscriptionManager } from "../events/SubscriptionManager"
import { randomUUID } from "crypto"
import { isStoreObject, makePrivatePropertyKey, makePrivateProxyKey } from "./utils"
import { isSimplePropType } from "../meta/PropertyDefinitions"
import { IObjectManager } from "../interfaces/IObjectManager"

export type InternalRecipe = ((obj: StoreObject) => void) | (() => any)

export class StoreClass implements IObjectManager {
  private stateHistory: State[] = [] // Stores the history of states
  private subscriptionManager = new SubscriptionManager(this) // Create a subscription manager
  private currentStateIndex: number = -1 // Track active state index
  private inUpdateMode: boolean = false // Flag to indicate if the store is in update mode
  private typeToClassMap: Map<string, any> = new Map() // Maps type names to dynamic classes
  private metaInfo: Map<string, TypeMeta> // Metadata information for each type

  constructor(metaInfo: Map<string, TypeMeta>) {
    this.metaInfo = metaInfo
    // Create dynamic classes for each type
    for (const [type, typeMeta] of metaInfo) {
      if (!this.typeToClassMap.has(type)) {
        this.createDynamicClass(typeMeta, this)
      }
    }
  }

  public get objects(): IObjectManager {
    return this
  }

  public getMeta(type: string): TypeMeta {
    return this.typeToClassMap.get(type)
  }

  public getSubscriptionManager(): SubscriptionManager {
    return this.subscriptionManager
  }

  /** Returns the UUID of a store object */
  public getUUID<T extends object>(obj: T): string {
    if (!(obj instanceof __StoreSuperClass__)) {
      throw new Error("The provided object is not a valid store object.")
    }
    return (obj as any)[uuid]
  }

  public get<T extends object>(obj: string | T, stateIndex?: number): T | undefined {
    if (stateIndex !== undefined) {
      return this.fromState<T>(stateIndex, obj)
    } else {
      if (typeof obj === "string") {
        return this.findObjectByUUID<T>(obj)
      } else if (obj instanceof __StoreSuperClass__) {
        const uuidValue = (obj as any)[uuid]
        return this.findObjectByUUID<T>(uuidValue)
      }
    }
    return undefined
  }

  /** Finds objects of a specific type that match a given predicate */
  public find<T extends object>(objectType: string, predicate?: (obj: T) => boolean, state?: number): T[] {
    const targetState = state !== undefined ? this.getStateByIndex(state) : this.getState()
    const DynamicClass = this.typeToClassMap.get(objectType)
    if (!DynamicClass) {
      throw new Error(`Unknown type: ${objectType}. Cannot search for objects.`)
    }
    return targetState.findObjects(DynamicClass, predicate) as T[]
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
  public create<T>(type: string, initialState: Partial<T> = {}, processed: Map<any, any> = new Map()): T {
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
      const allProps = this.getAllProperties(type)
      for (const [propName, propMeta] of allProps) {
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
      return this.create(type, value, processed)
    } else if (isSimplePropType(type)) {
      // If the type is a simple property type, return the value directly
      return value
    } else {
      throw new Error(`Invalid value '${value}' for type '${type}'.`)
    }
  }

  /* deletes an object from the store
   */
  public delete<T extends object>(obj: T): void {
    if (!(obj instanceof __StoreSuperClass__)) {
      throw new Error("The provided object is not a valid store object.")
    }
    const objUUID = (obj as any)[uuid]
    const currentState = this.getState()
    currentState.deleteObject(objUUID)
  }

  /// Converts an object to an immutable version and adds it to the store
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
        if (exObj.constructor.name !== typeName) {
          throw new Error(
            `Type mismatch detected: The provided object has UUID '${uuidValue}' and type '${typeName}', but an existing object with the same UUID belongs to type '${exObj.constructor.name}'. Ensure that the UUIDs are unique across different types or verify the object's type.`
          )
        }
        return exObj as T // Return the existing object from the store
      }

      // Create a new instance of the store object using the type
      const DynamicClass = this.typeToClassMap.get(typeName)
      if (!DynamicClass) {
        throw new Error(`No constructor found for type: ${typeName}. Cannot create object.`)
      }
      const newObject = new DynamicClass()
      // Add the object to the processed map to handle cyclic references
      processed.set(obj, newObject)

      // Initialize properties
      const allProps = this.getAllProperties(typeName)
      for (const [propName, propMeta] of allProps) {
        const value = (obj as any)[propName] // Get the value from the input object

        if (value === undefined) {
          continue // Skip undefined properties
        }

        // Handle collections and nested objects
        const privateKey = makePrivatePropertyKey(propName) // Get the private property name

        if (propMeta.type === "array") {
          value.forEach((item: any) => {
            const itemType = item["@AelasticsType"] || propMeta.domainType // Use the special property or fallback to metadata
            const element = this.toImmutable(item, itemType, processed)
            ;(newObject as any)[privateKey].push(element)
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
      ;(newObject as any)[createdAt] = (obj as any)["@AelasticsCreatedAt"] // Use the original creation timestamp

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

  /// Converts an immutable object back to a literal object
  /// the object stays in the store.
  public fromImmutable<T extends object>(storeObject: T, processed = new Map<any, any>()): any {
    // Check if the object is a store object
    if (!(storeObject instanceof __StoreSuperClass__)) {
      throw new Error(`The provided object is not a valid store object.`)
    }

    // Check for cyclic structures
    if (processed.has(storeObject[uuid])) {
      return processed.get(storeObject[uuid]) // Return the previously processed literal object
    }

    // Create a literal object
    const literalObject: any = {}
    processed.set(storeObject[uuid], literalObject) // Add to the processed map to handle cyclic references

    // Add metadata properties
    const typeName = storeObject.constructor.name // Use the constructor name to determine the type
    literalObject["@AelasticsType"] = typeName // Add the special property for the type
    literalObject["@AelasticsUUID"] = (storeObject as any)[uuid] // Add the UUID
    literalObject["@AelasticsCreatedAt"] = (storeObject as any)[createdAt] // Add the createdAt timestamp

    // Retrieve metadata for the object's type
    const typeMeta = this.metaInfo.get(typeName)
    if (!typeMeta) {
      throw new Error(`Unknown type: ${typeName}. Cannot export object.`)
    }

    // Iterate over properties
    const allProps = this.getAllProperties(typeName)
    for (const [propName, propMeta] of allProps) {
      const value = (storeObject as any)[propName] // Access the private property value

      if (value === undefined) {
        continue // Skip undefined properties
      }

      // Handle collections and nested objects
      if (propMeta.type === "array") {
        const a = value.map((item: any) => this.fromImmutable(item, processed))
        literalObject[propName] = a
      } else if (propMeta.type === "map") {
        literalObject[propName] = Array.from(value.entries() as [any, any][]).reduce(
          (acc: any, [key, val]: [any, any]) => {
            acc[key] = this.fromImmutable(val, processed)
            return acc
          },
          {}
        )
      } else if (propMeta.type === "set") {
        literalObject[propName] = Array.from(value).map((item: any) => this.fromImmutable(item, processed))
      } else if (propMeta.type === "object") {
        literalObject[propName] = this.fromImmutable(value, processed)
      } else {
        // Simple property
        literalObject[propName] = value
      }
    }

    // Return the literal object
    return literalObject
  }

  /**
   * Serializes an object from the store into a custom JSON format.
   * Handles cyclic references by ensuring each object is serialized only once.
   * Collections (arrays, maps, sets) store only UUIDs of objects.
   * @param rootObject - The root object to serialize.
   * @returns A JSON string representing the serialized object graph.
   */
  public serialize(rootObject: any): string {
    const processed = new Map<string, any>() // Map to track serialized objects by UUID
    const serializedObjects: any[] = [] // Array to store serialized objects

    // Helper function to serialize an object
    const serializeObject = (obj: any): void => {
      if (!isStoreObject(obj)) {
        throw new Error("The provided object is not a valid store object.")
      }

      const objectUUID = this.getUUID(obj)

      // If the object is already processed, return its UUID directly
      if (processed.has(objectUUID)) {
        return // objectUUID; // Return only the UUID
      }

      // Create a serialized representation with UUID and object type
      const serialized: any = {
        "@AelasticsUUID": objectUUID,
        "@AelasticsType": obj.constructor.name, // Add object type
      }

      // Add the object to the processed map
      processed.set(objectUUID, serialized)

      // Retrieve all properties from metadata
      const properties = this.getAllProperties(obj.constructor.name)

      // Iterate over the properties using metadata
      for (const [key, meta] of properties.entries()) {
        const value = obj[key]

        if (meta.type === "object") {
          // If the property is an object, serialize it as a UUID
          if (isStoreObject(value)) {
            serializeObject(value) // Continue serialization recursively
            serialized[key] = this.getUUID(value)
          } else {
            serialized[key] = undefined
          }
        } else if (meta.type === "array") {
          // If the property is an array, store UUIDs of objects
          serialized[key] = Array.isArray(value)
            ? value.map((item) => {
                if (isStoreObject(item)) {
                  serializeObject(item) // Continue serialization recursively
                  return this.getUUID(item) // Store only the UUID
                }
                return item // For primitives or non-store objects
              })
            : []
        } else if (meta.type === "map") {
          // If the property is a map, store UUIDs for keys and values
          serialized[key] =
            value instanceof Map
              ? Array.from(value.entries()).map(([mapKey, mapValue]) => {
                  if (isStoreObject(mapKey)) {
                    serializeObject(mapKey) // Continue serialization recursively
                  }
                  if (isStoreObject(mapValue)) {
                    serializeObject(mapValue) // Continue serialization recursively
                  }
                  return {
                    key: isStoreObject(mapKey) ? this.getUUID(mapKey) : mapKey, // Store only the UUID for keys
                    value: isStoreObject(mapValue) ? this.getUUID(mapValue) : mapValue, // Store only the UUID for values
                  }
                })
              : []
        } else if (meta.type === "set") {
          // If the property is a set, store UUIDs of objects
          serialized[key] =
            value instanceof Set
              ? Array.from(value.values()).map((item) => {
                  if (isStoreObject(item)) {
                    serializeObject(item) // Continue serialization recursively
                    return this.getUUID(item) // Store only the UUID
                  }
                  return item // For primitives or non-store objects
                })
              : []
        } else {
          // For primitive types or
          // non-reference properties, include as-is
          serialized[key] = value
        }
      }
      serializedObjects.push(serialized) // Add to the serialized objects array
      return // serialized;
    }

    // Start serialization from the root object
    serializeObject(rootObject)

    // Return the serialized objects as a JSON string
    return JSON.stringify(serializedObjects) // Pretty-printed JSON
  }

  /**
   * Deserializes a JSON string into a graph of objects.
   * @param jsonString - The JSON string to deserialize.
   * @returns The root object of the deserialized graph.
   */
  public deserialize(jsonString: string): any {
    const wasInUpdateMode = this.inUpdateMode // Check if the store is already in update mode
    const processed = new Set<string>() // Set to track processed objects
    const unResolved = new Set<string>() // Set to track unresolved references
    try {
      // Check if update mode is already active
      if (!wasInUpdateMode) {
        this.inUpdateMode = true // Enter update mode if not already in it
        this.makeNewState() // Create a new state for the transaction
      }

      // Parse the JSON string
      const serializedObjects = JSON.parse(jsonString)

      // Validate that the parsed JSON is an array
      if (!Array.isArray(serializedObjects)) {
        throw new Error("Deserialization error: Expected an array of serialized objects.")
      }

      // Create and initialize objects in a single pass
      const createdObjects = serializedObjects.map((serialized, index) => {
        // Validate that @AelasticsUUID and @AelasticsType are properly initialized
        const uuidValue = serialized["@AelasticsUUID"]
        const typeName = serialized["@AelasticsType"]
        if (typeof uuidValue !== "string") {
          throw new Error(`Deserialization error: Missing or invalid '@AelasticsUUID' in object at index ${index}.`)
        }
        if (typeof typeName !== "string") {
          throw new Error(`Deserialization error: Missing or invalid '@AelasticsType' in object at index ${index}.`)
        }

        // Check if the object with this UUID already exists in the store
        const existingObject = this.getState().getObject(uuidValue)
        if (existingObject) {
          throw new Error(
            `Deserialization error: Object '${typeName}' with UUID '${uuidValue}' already exists in the store.`
          )
          // If the object already exists, return it
          // return existingObject;
        }
 
        // Dynamically instantiate the object using its type
        const objectClass = this.getClassByName(typeName) // Retrieve the class constructor
        if (!objectClass) {
          throw new Error(`Unknown type '${typeName}' for object with UUID '${uuidValue}'`)
        }
        const createdObject = new objectClass() // Create an empty instance of the class
        createdObject[uuid] = uuidValue // Set the UUID
       // Add the UUID to the processed set
       processed.add(uuidValue)
       this.getState().addObject(createdObject, "imported") // Add the object to the current state

        // Retrieve meta information for the object's type
        const metaInfo = this.getAllProperties(typeName)

        // Populate the object's private properties using meta information
        for (const [key, meta] of metaInfo.entries()) {
          const privateKey = makePrivatePropertyKey(key) // Convert the key to a private property key
          const value = serialized[key]

          if (meta.type === "object") {
            // Handle object references: Insert UUID directly
            if (value === undefined || value === null) {
              createdObject[privateKey] = undefined
              continue
            }
            if (typeof value !== "string") {
              throw new Error(`Expected a UUID (string) for property '${key}', but got ${typeof value}`)
            }
            createdObject[privateKey] = value
            // Check if the referenced object is already processed
            if (!processed.has(value)) {
              unResolved.add(value) // Add to the unresolved set
            }
          } else if (meta.type === "array") {
            // Handle arrays: Use `push` to populate the array
            if (!Array.isArray(value)) {
              throw new Error(`Expected an array for property '${key}', but got ${typeof value}`)
            }
            value.forEach((item) => {
              createdObject[privateKey].push(item)
              if (meta.itemType === "object") {
                // If the item is an object, add to unresolved set if necessary
                if (!processed.has(item)) {
                  unResolved.add(item) // Add to the unresolved set
                }
              }
            })
          } else if (meta.type === "map") {
            // Handle maps: Use `set` to populate the map
            if (!(value instanceof Array)) {
              throw new Error(`Expected an array of key-value pairs for property '${key}', but got ${typeof value}`)
            }
            value.forEach(({ key: mapKey, value: mapValue }) => {
              createdObject[privateKey].set(mapKey, mapValue)
              if (meta.itemType === "object") {
                // If the map value is an object,add to unresolved set if necessary
                if (!processed.has(mapValue)) {
                  unResolved.add(mapValue) // Add to the unresolved set
                }
              }
              if (meta.keyType === "object") {
                // If the map key is an object,add to unresolved set if necessary
                if (!processed.has(mapKey)) {
                  unResolved.add(mapKey) // Add to the unresolved set
                }
              }
            })
          } else if (meta.type === "set") {
            // Handle sets: Use `add` to populate the set
            if (!(value instanceof Array)) {
              throw new Error(`Expected an array for property '${key}', but got ${typeof value}`)
            }
            value.forEach((item) => {
              createdObject[privateKey].add(item)
              if (meta.itemType === "object") {
                // If the item is an object, add to unresolved set if necessary
                if (!processed.has(item)) {
                  unResolved.add(item) // Add to the unresolved set
                }
              }
            })
          } else {
            // Default case: Handle primitive types
            createdObject[privateKey] = value
          }
        }

        return createdObject
      })

      // check if there are any unprocessed objects
      const unresolvedNotProcessed = Array.from(unResolved).filter((item) => !processed.has(item))
      if (unresolvedNotProcessed.length > 0) {
        // Handle unresolved objects that are not in the processed set
        throw new Error(
          `Deserialization error: The following objects were not resolved: ${unresolvedNotProcessed.join(", ")}`
        )
      }
      // Return the last object in the array
      return createdObjects[createdObjects.length - 1]
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
  public update<T>(recipe: (obj: T) => void, obj?: T): T {
    let hasError = false
    const wasInUpdateMode = this.inUpdateMode
    try {
      if (!wasInUpdateMode) {
        this.inUpdateMode = true // Enter update mode if not already in it
        this.makeNewState() // Create a new state for the update
      }
      if (obj) {
        // If an object is provided, apply the recipe to it
        if (!(obj instanceof __StoreSuperClass__)) {
          throw new Error("Invalid object: Ensure it was created or imported using the store.")
        }
        recipe(obj) // Apply modifications
        let newObj = this.getState().getObject(obj[uuid]) // get the latest version
        return newObj as T
      } else {
        // If no object is provided, apply the recipe to the store
        const result = (recipe as () => T)()
        return result
      }
    } catch (error) {
      hasError = true // Set error flag
      console.error("An error occurred while applying the recipe:", error)
      this.revertToPreviousState()
      throw error // Re-throw the error after logging it
    } finally {
      if (!wasInUpdateMode) {
        this.inUpdateMode = false // Exit update mode if it was set by this method
      }
      if (!hasError) {
        this.subscriptionManager.notifySubscribers() // Notify all subscribers of the store and objects
      }
    }
  }

  /** Creates a dynamic class based on the provided type metadata */
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

  /**
   * Function to find all properties of a type, including properties from its supertypes.
   * @param typeName - The name of the type whose properties are to be found.
   * @param metaInfo - Metadata information for each type.
   * @returns A Map containing all properties of the type, with properties from supertypes first.
   */
  public getAllProperties(typeName: string): Map<string, PropertyMeta> {
    const result = new Map<string, PropertyMeta>()
    const metaInfo: Map<string, TypeMeta> = this.metaInfo

    // Recursive function to collect properties from the type and its supertypes
    function collectProperties(currentTypeName: string) {
      const typeMeta = metaInfo.get(currentTypeName)
      if (!typeMeta) {
        throw new Error(`Type ${currentTypeName} not found in metadata.`)
      }
      // Recursively collect properties from the supertype first
      if (typeMeta.extends) {
        collectProperties(typeMeta.extends)
      }
      // Add properties from the current type (overrides will replace existing entries)
      for (const [propName, propMeta] of typeMeta.properties) {
        result.set(propName, propMeta)
      }
    }
    // Start collecting properties from the specified type
    collectProperties(typeName)
    return result
  }

  // TODO tests
  public getAllChanges(option: "all" | "only_modifications" = "all"): ChangeLogEntry[] {
    const changeLogs: ChangeLogEntry[] = []
    for (const state of this.stateHistory) {
      changeLogs.push(...state.getChangeLog(option))
    }
    return changeLogs
  }

  // TODO tests
  public consolidateStates(): void {
    // return consolidateChangeLogs(this.stateHistory.map((state) => state.getChangeLog()))
  }

  // public getJsonPatch(): JSONPatchOperation[] {
  //   return generateJsonPatch(this.getConsolidatedChangeLog())
  // }
}
