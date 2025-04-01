import { EventPayload, Result } from '../events/EventTypes';

export type Timing = 'before' | 'after' | 'beforeCommit' | 'afterCommit' | '*';
export type Operation = 'create' | 'update' | 'delete' | 'import'| '*'; // "update" for both scalar and collection changes
export type Type = string | '*';
export type Property = string | '*';

/**
 * A subscription interface for subscribing to event patterns.
 */
export interface SubscriptionInterface {
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