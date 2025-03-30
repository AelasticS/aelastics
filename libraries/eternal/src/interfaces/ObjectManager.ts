import { Result } from "../events/EventTypes"

export interface ObjectManager {
  /**
   * Creates a new object of a specific type T.
   * @param type - The name of object type defined in type schema.
   * @returns The newly created object.
   */
  create<T extends object>(type: string, initialState?: T): T

  /**
   * Applies a recipe function to an object to update its state. A new state in store is automatically created
   * @param recipe - A function that takes the object and modifies it mutably.
   * @param obj - The object to be updated.
   * @returns The new version of the input object.
   */
  update<T extends object>(recipe: (obj: T) => void, obj: T): T

  /**
   * Removes an object from the store.
   * @param obj - The object to be deleted.
   */
  delete<T extends object>(obj: T): void

  /**
   * Retrieves then latest version of an object by its UUID or reference.
   * @param obj - UUID or reference to an object within the store
   * @returns The object if found, otherwise undefined.
   */
  getLastVersion<T extends object>(obj: string | T): T | undefined
  /**
   * Retrieves an object from a specific historical state.
   * @param stateIndex - The index of the historical state.
   * @param target - The target object or its identifier.
   * @returns The object from the specified historical state if found, otherwise undefined.
   */
  fromState<T extends object>(stateIndex: number, target: string | T): T | undefined

  /**
   * Converts a given object into an object under control of Store.
   */
  immutable<T extends object>(obj: T): T

  /**
   * Converts an object back to a regular (mutable) object, removing it from the control of Store.
   */
  mutable<T extends object>(obj: T): T

  /**
   * Subscribes to updates of an object.
   * @param callback - A callback function that processes the updated object.
   * @returns A function that can be called to unsubscribe from the store updates.
   */
  subscribe<T extends object>(obj: T, callback: (updatedObject: T) => void): () => void


  /**
   * Serializes an object into a string format.
   * @param obj - The object to serialize.
   * @returns The JSON-formatted string representation of the object.
   */
  serialize<T extends object>(obj: T): string

  /**
   * Deserializes a string into an object of type T and puts it into the store.
   * @param json - The JSON-formatted string to be deserialized.
   * @param type - The type of the object to deserialize.
   * @param validate - Optional flag to validate the object against its type schema. Default is true.
   * @returns The deserialized object of type T.
   */
  deserialize<T extends object>(obj: string, type: string, validate?: boolean): T

  /**
   * Validates an object against its type schema.
   * @param obj - The object to validate.
   * @returns The result of the validation.
   */
  validate<T extends object>(obj: T): Result
}
