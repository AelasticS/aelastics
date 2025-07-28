import { EventPayload, Result } from "../events/EventTypes";
import { Timing, Operation, Type, Property } from "./ISubscriptionManager";

/// Interface for event subscription management
/// This interface defines methods for subscribing to various events in the system,
/// allowing listeners to react to changes in the store, specific objects, or general updates.
/// It includes methods for subscribing to events with specific timing and operation types,
/// as well as methods for subscribing to updates on specific objects or the entire store.
export interface IEvents {
 /**
   * Subscribes to event patterns, returns a function that can be called to unsubscribe.
   * 
   * @param listener - A callback function that processes the event payload and returns a Result.
   * @param timing - The timing of the event (e.g., "before", "after").
   * @param operation - The type of operation (e.g., "create", "update", "delete").
   * @param objectType - The type of the object being modified (e.g., "Person").
   * @param property - The property being modified (optional).
   * @returns A function that can be called to unsubscribe from the event.
   */
  subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation, 
    objectType: Type,
    property?: Property 
  ): () => void;

  /**
   * Subscribes a callback to be notified when the given object is updated.
   * 
   * @param object - The object to monitor for updates.
   * @param listener - A callback function that processes the updated object.
   * @returns A function that can be called to unsubscribe from the updates.
   */
  subscribeToObject<T extends object>(object: T, listener: (updatedObject: T) => void): () => void;

  /**
   * Subscribes a callback to be notified when the store is updated.
   * 
   * @param listener - A callback function that processes the store update.
   * @returns A function that can be called to unsubscribe from the store updates.
   */
  subscribeToStore(listener: () => void): () => void;

}