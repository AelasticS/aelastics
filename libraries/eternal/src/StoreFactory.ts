import { EternalStore, InternalRecipe } from "./EternalStore"
import { EventPayload, Result } from "./events/EventTypes"
import { ChangeType, Operation, Property, Timing, Type } from "./events/SubscriptionInterface"
import { EternalObject } from "./handlers/InternalTypes"
import { TypeMeta, TypeSchema } from "./meta/InternalSchema"

/**
 * Interface representing a Store that manages objects and their states.
 */
export interface Store {
  /**
   * Creates a new object of a specific type.
   * @param type - The type of the object to create.
   * @returns The newly created object.
   */
  createObject<T extends object>(type: string): T

  /**
   * Applies a recipe function to an object to update its state. A new state in store is automatically created
   * @param recipe - A function that takes the object and modifies it mutably.
   * @param obj - The object to be updated.
   * @returns The new version of the input object.
   */
  updateObject<T>(recipe: (obj: T) => void, obj: T): T

  /**
   * Applies a recipe function to update the store's state. A new state in store is automatically created
   * @param recipe - A function that modifies the store's state.
   * @returns The result of the recipe function.
   */
  updateState<R>(recipe: () => R): R

  /**
   * Retrieves an object by its UUID.
   * @param uuid - The UUID of the object to retrieve.
   * @returns The object if found, otherwise undefined.
   */
  getObject<T extends object>(uuid: string): T | undefined

  /**
   * Checks if the store is currently in update mode.
   * @returns True if in update mode, otherwise false.
   */
  isInUpdateMode(): boolean

  /**
   * Undoes the last state change.
   * @returns True if the undo was successful, otherwise false.
   */
  undo(): boolean

  /**
   * Redoes the last undone state change.
   * @returns True if the redo was successful, otherwise false.
   */
  redo(): boolean

  /**
   * Retrieves an object from a specific historical state.
   * @param stateIndex - The index of the historical state.
   * @param target - The target object or its identifier.
   * @returns The object from the specified historical state if found, otherwise undefined.
   */
  fromState<T>(stateIndex: number, target: string | T): T | undefined

  createObject<T extends object>(type: string): T

  // Apply a recipe to an object
  updateObject<T>(recipe: (obj: T) => void, obj: T): T

  // Apply a recipe to an object
  updateState<R>(recipe: () => R): R

  // Retrieve an object by UUID
  getObject<T extends object>(uuid: string): T | undefined

  /** Check if produce() is currently active */
  isInUpdateMode(): boolean

  /** Undo last state change */
  undo(): boolean

  /** Redo last undone state change */
  redo(): boolean

  /** Retrieve an object from a specific historical state */
  fromState<T>(stateIndex: number, target: string | T): T | undefined

  //
  /**
   * Converts a given object into an eternal object under control of EternalStore.
   */
  makeEternal<T>(obj: T): T

  /**
   * Converts an eternal object back to a regular (mutable) object, removing it from the control of EternalStore.
   */
  makeRegular<T>(obj: T): T

  /**
   *
   * Subscribes/unsubscribe to updates of a specific object.
   * @param obj - The object to subscribe/unsubscribe to.
   * @param callback - The callback function to be called when the object is updated.
   */
  subscribeToObject(obj: object, callback: (updatedObj: object) => void): () => void
  // unsubscribeFromObject(obj: object, callback: (updatedObj: object) => void): void

  /**
   *
   * Subscribes/unsubscribe to updates of store.
   * @param callback - The callback function to be called when store is updated.
   */
  subscribeToStore(callback: () => void): () => void
  // unsubscribeFromStore(callback: () => void): void

  // Subscribes to event patterns, returns a function that can be called to unsubscribe
  subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation,
    type: Type,
    property?: Property,
    changeType?: ChangeType
  ): () => void

  /**
   * Retrieves the internal EternalStore instance.
   * @returns The internal EternalStore instance.
   */
  getEternalStore(): EternalStore
}

export type recipe<T> = (obj: T) => void

export function createStore(
  metaInfo: Map<string, TypeMeta> | TypeSchema,
  initialState: any = {},
  options: {
    freeze?: boolean
    fetchFromExternalSource?: (type: string, uuid: string) => any
  } = { freeze: true }
): Store {
  if (!metaInfo) {
    throw new Error("meta information is required to create a store")
  }
  const types: Map<string, TypeMeta> = (metaInfo as TypeSchema).types || (metaInfo as Map<string, TypeMeta>)
  const store = new EternalStore(types)

  const publicAPI: Store = {
    createObject: (type) => store.createObject(type), // TODO check if new state is always created
    updateObject: <T>(recipe: (obj: T) => void, obj: T) =>
      store.produce(recipe as InternalRecipe, obj as EternalObject) as any,
    updateState: <R>(recipe: () => R) => store.produce(recipe as InternalRecipe) as any,
    getObject: (uuid) => store.getObject(uuid),
    isInUpdateMode: () => store.isInUpdateMode(),
    makeRegular: <T>(obj: T) => store.isInUpdateMode() as T, // TODO dummy implementation
    undo: () => store.undo(),
    redo: () => store.redo(),
    fromState: (stateIndex, target) => store.fromState(stateIndex, target),
    makeEternal: <T>(obj: T) => store.isInUpdateMode() as T, // TODO dummy implementation

    subscribeToObject: (obj, callback) => store.getSubscriptionManager().subscribeToObject(obj, callback),
    //  unsubscribeFromObject: (obj, callback) => store.getSubscriptionManager().unsubscribeFromObj(obj, callback),
    subscribeToStore: (callback) => store.getSubscriptionManager().subscribeToStore(callback),
    //   unsubscribeFromStore: (callback) => store.getSubscriptionManager().unsubscribeFromStore(callback),
    subscribe: (
      listener: (event: EventPayload) => Result,
      timing: Timing,
      operation: Operation,
      type: Type,
      property?: Property,
      changeType?: ChangeType
    ) => store.getSubscriptionManager().subscribe(listener, timing, operation, type, property, changeType),
    getEternalStore: () => store,
  }

  return options.freeze ? Object.freeze(publicAPI) : publicAPI
}
