import { Result } from "../events/EventTypes"

/**
 * Interface representing an object manager that provides methods for creating, updating, deleting,
 * retrieving, and managing objects in a store. It also supports serialization, deserialization,
 * and validation of objects against their type schemas.
 */
export interface ObjectManager {
  /**
   * Creates a new object of a specified type and optionally initializes it with a given state.
   * The created object is automatically managed by the store.
   *
   * @template T - The type of the object to create.
   * @param type - The name of the object type as defined in the type schema.
   * @param initialState - Optional initial state to assign to the object.
   * @returns The newly created and managed object of type T.
   */
  create<T extends object>(type: string, initialState?: Partial<T>): T

  /**
   * Updates the state of an object by applying a recipe function.
   * The recipe function mutably modifies the object, and the store creates a new version of the object with the updated state.
   *
   * @template T - The type of the object to update.
   * @param recipe - A function that receives the object and applies mutable changes to it.
   * @param obj - The object to be updated.
   * @returns The updated object reflecting the new state.
   * @throws Error if the update is canceled by event handlers.
   */
  update<T extends object>(recipe: (obj: T) => void, obj: T): T

  /**
   * Deletes an object from the current state.
   * All references from the object, including bidirectional associations, are automatically disconnected.
   * Directed references to the object (not part of bidirectional associations) are not deleted.
   *
   * @template T - The type of the object to delete.
   * @param obj - The object to be removed from the store.
   * @throws Error if the deletion is canceled by event handlers.
   */
  delete<T extends object>(obj: T): void

  /**
   * Retrieves an object from the store, either in its latest state or a specific version.
   *
   * @template T - The type of the object to retrieve.
   * @param obj - The UUID or reference to the object. Can also be an earlier version of the object.
   * @param state - Optional parameter to specify the desired state. Can be a state index (number) or a state tag (string).
   *                If not provided, the current (last) state is used and the latest state of the object is returned.
   * @returns The object in the requested state, or undefined if not found.
   */
  get?<T extends object>(obj: string | T, state?: number | string): T | undefined

  /**
   * Finds objects of a specific type that match a given predicate function.
   *
   * @template T - The type of the objects to search for.
   * @param objectType - The name of the object type as defined in the type schema.
   * @param predicate - A function that evaluates each object and returns true for matches.
   * @param state - Optional parameter to specify the state to search in.
   *               Can be a state index (number) or a state tag (string).
   *               If not provided, the current state of the store is searched.
   * @returns An array of objects that match the predicate.
   */
  find?<T extends object>(objectType: string, predicate: (obj: T) => boolean, state?: number | string): T[]

  /* Get unique identifier (UUID) of an object
   * @template T - The type of the object to get the UUID for.
   * @param obj - The object to retrieve the UUID from.
   * @returns The UUID of the object.
   * @throws Error if the object is not managed by the store or does not have a UUID.
   */
  getUUID<T extends object>(obj: T): string

  /**
   * Converts a mutable object into an immutable object managed by the store.
   * The object becomes subject to state management and tracking.
   *
   * @template T - The type of the object to convert.
   * @param obj - The mutable object to be converted.
   * @returns The immutable version of the input object.
   */
  toImmutable<T extends object>(obj: T): T

  /**
   * Converts an immutable object managed by the store back into a literal (mutable) object.
   * The object is removed from the store's control and state management.
   *
   * @template T - The type of the object to convert.
   * @param obj - The immutable object to be converted.
   * @returns The mutable version of the input object.
   */
  fromImmutable<T extends object>(obj: T): T

  /**
   * Serializes an object into a JSON-formatted string based on UUIDs.
   *
   * @template T - The type of the object to serialize.
   * @param obj - The object to be serialized.
   * @returns A JSON-formatted string representation of the object.
   */
  serialize?<T extends object>(obj: T): string

  /**
   * Deserializes a JSON-formatted string based on UUIDs into an object of a specified type and adds it to the store.
   * Optionally validates the object against its type schema.
   *
   * @template T - The type of the object to deserialize.
   * @param json - The JSON-formatted string to deserialize.
   * @param type - The name of the object type as defined in the type schema.
   * @param validate - Optional flag to validate the object against its type schema. Defaults to true.
   * @returns The deserialized object of type T.
   * @throws Error if the json iis not UUID based format.
   */
  deserialize?<T extends object>(json: string, type: string, validate?: boolean): T

  /**
   * Validates an object against its type schema to ensure it conforms to the expected structure and rules.
   *
   * @template T - The type of the object to validate.
   * @param obj - The object to validate.
   * @returns The result of the validation, indicating success or failure.
   */
  validate?<T extends object>(obj: T): Result
}
