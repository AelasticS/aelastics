import { Any } from './DefinitionAPI'

/**
 * Manages a registry of visited nodes to handle complex object graphs and prevent
 * redundant processing of the same object instances within operations such as
 * serialization, deserialization, or validation.
 */
export class VisitedNodes {
  // Counter to generate unique identifiers for new nodes
  private _counter = 0;
  // Map to store types and their corresponding instances using a nested map structure
  private mapOfTypes: Map<Any, Map<any, any>> = new Map();

  /**
   * Attempts to delete an instance of a specific type from the registry.
   * @param [t, i] Tuple of type and instance to delete.
   * @returns True if the instance was successfully deleted, false otherwise.
   */
  delete([t, i]: [Any, any]): boolean {
    let typeMap = this.mapOfTypes.get(t);
    if (!typeMap) {
      return false;
    }
    return typeMap.delete(i);
  }

  /**
   * Clears all entries from the registry.
   */
  clear(): void {
    this.mapOfTypes.clear();
  }

  /**
   * Generates a new unique identifier for a node.
   * @returns A new unique identifier as a number.
   */
  newID(): number {
    return ++this._counter;
  }

  /**
   * Checks whether a specific type and instance combination has been visited/registered.
   * @param [t, i] Tuple of type and instance to check.
   * @returns True if the instance has been registered under the specified type, false otherwise.
   */
  has([t, i]: [Any, any]): boolean {
    let typeMap = this.mapOfTypes.get(t);
    if (!typeMap) return false;
    else {
      return typeMap.has(i);
    }
  }

  /**
   * Registers or updates an instance with a new value under a specific type.
   * If the instance is undefined, it is ignored (not registered).
   * @param [t, i]  Tuple of type and instance to register or update.
   * @param n The value to associate with the instance.
   * @returns The current instance of this VisitedNodes class for method chaining.
   */
  set([t, i]: [Any, any], n: any): this {
    if (i === undefined) // ignore undefined instances
      return this;
    let typeMap = this.mapOfTypes.get(t);
    if (!typeMap) {
      typeMap = new Map();
      this.mapOfTypes.set(t, typeMap);
    }
    typeMap.set(i, n);
    return this;
  }

  /**
   * Retrieves the value associated with a specific type and instance.
   * @param [t, i] Tuple of type and instance to retrieve the value for.
   * @returns The value associated with the instance if it exists, undefined otherwise.
   */
  get([t, i]: [Any, any]): undefined | any {
    let typeMap = this.mapOfTypes.get(t);
    if (typeMap) {
      return typeMap.get(i);
    }
    return undefined;
  }
}
