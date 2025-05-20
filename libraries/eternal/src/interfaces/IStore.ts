import { StoreClass } from "../store/StoreClass"
import { EventPayload, Result } from "../events/EventTypes"
import { ISubscriptionManager, Operation, Property, Timing, Type } from "./ISubscriptionManager"
import { IObjectManager } from "./IObjectManager"

/**
 * Interface representing a Store that manages objects and their states.
 */
export interface IStore {


  /**
   * The objectManager provides methods for creating, updating, retrieving, and managing the lifecycle of objects within the store.
   * It acts as the primary interface for object-level operations, ensuring consistency and encapsulation of object management logic.
   * @returns The object manager instance responsible for handling objects in the store.
   */
  get objectManager(): IObjectManager
  

  /**
   * The subscriptionManager responsible for managing subscriptions to events and changes in the store.
   * It allows for subscribing to specific events and notifying subscribers when those events occur.
   * @returns The subscription manager instance.
   */
  get subscriptionManager(): ISubscriptionManager
  
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
  updateObject<T extends object>(recipe: (obj: T) => void, obj: T): T

  /**
   * Applies a recipe function to update the store. A new state in the store is automatically created
   * @param recipe - A function that modifies the store's state.
   * @returns The result of the recipe function.
   */
  updateStore<R>(recipe: () => R): R

  /**
   * Retrieves an object by its UUID.
   * @param uuid - The UUID of the object to retrieve.
   * @returns The object if found, otherwise undefined.
   */
  findObjectByUUID<T extends object>(uuid: string): T | undefined

  /**
   * Retrieves an object from a specific historical state.
   * @param stateIndex - The index of the historical state.
   * @param target - The target object or its identifier.
   * @returns The object from the specified historical state if found, otherwise undefined.
   */
  fromState<T>(stateIndex: number, target: string | T): T | undefined

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
   * Retrieves the internal EternalStore instance.
   * @returns The internal EternalStore instance.
   */
  getEternalStore(): StoreClass
}

export interface SubscriptionManager {} // subscriptions
export interface SchemaManager {} // schemas

export interface StoreManager  {
  serialize():string
  deserialize(json: string, validate?: boolean): void
  validate(): Result
}