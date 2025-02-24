import { EternalStore, InternalRecipe } from "./EternalStore"
import { EternalObject } from "./handlers/InternalTypes"
import { TypeMeta } from "./handlers/MetaDefinitions"

/**
 * Interface representing a Store that manages objects and their states.
 */
export interface Store {
  /**
   * Creates a new object of a specific type.
   * @param type - The type of the object to create.
   * @returns The newly created object.
   */
  createObject<T extends object>(type: string): T;

  /**
   * Applies a recipe function to an object to update its state. A new state in store is automatically created
   * @param recipe - A function that takes the object and modifies it mutably.
   * @param obj - The object to be updated.
   * @returns The new version of the input object.
   */
  updateObject<T>(recipe: (obj: T) => void, obj: T): T;

  /**
   * Applies a recipe function to update the store's state. A new state in store is automatically created
   * @param recipe - A function that modifies the store's state.
   * @returns The result of the recipe function.
   */
  updateState<R>(recipe: () => R): R;

  /**
   * Retrieves an object by its UUID.
   * @param uuid - The UUID of the object to retrieve.
   * @returns The object if found, otherwise undefined.
   */
  getObject<T extends object>(uuid: string): T | undefined;

  /**
   * Checks if the store is currently in update mode.
   * @returns True if in update mode, otherwise false.
   */
  isInUpdateMode(): boolean;

  /**
   * Undoes the last state change.
   * @returns True if the undo was successful, otherwise false.
   */
  undo(): boolean;

  /**
   * Redoes the last undone state change.
   * @returns True if the redo was successful, otherwise false.
   */
  redo(): boolean;

  /**
   * Retrieves an object from a specific historical state.
   * @param stateIndex - The index of the historical state.
   * @param target - The target object or its identifier.
   * @returns The object from the specified historical state if found, otherwise undefined.
   */
  fromState<T>(stateIndex: number, target: string | T): T | undefined;

createObject<T extends object>(type: string): T

// Apply a recipe to an object
updateObject<T>(recipe: (obj: T) => void, obj: T): T

// Apply a recipe to an object
updateState<R>(recipe: () => R): R;

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
makeEternal<T>(obj:T): T

/**
 * Converts an eternal object back to a regular (mutable) object, removing it from the control of EternalStore.
 */
makeRegular<T>(obj:T): T

}

export type recipe<T> = (obj: T) => void

export function createStore(
  metaInfo: Map<string, TypeMeta>,
  initialState: any = {},
  options: {
    freeze?: boolean
    fetchFromExternalSource?: (type: string, uuid: string) => any
  } = { freeze: true }
): Store {
  const store = new EternalStore(metaInfo)

  const publicAPI: Store = {
    createObject: (type) => store.createObject(type),
    updateObject: <T>(recipe: (obj: T) => void, obj: T) => store.produce(recipe as InternalRecipe, obj as EternalObject) as any,
    updateState: <R>(recipe:()=>R) => store.produce(recipe as InternalRecipe) as any,
    getObject: (uuid) => store.getObject(uuid),
    isInUpdateMode: () => store.isInUpdateMode(),
    undo: () => store.undo(),
    redo: () => store.redo(),
    fromState: (stateIndex, target) => store.fromState(stateIndex, target),
    makeEternal: <T>(obj: T) => store.isInUpdateMode() as T, // TODO dummy implementation
    makeRegular: <T>(obj: T) => store.isInUpdateMode() as T  // TODO dummy implementation
  }

  return options.freeze ? Object.freeze(publicAPI) : publicAPI
}
