import { EventPayload, Result } from './EventTypes';

export type Timing = 'before' | 'after' | 'beforeCommit' | 'afterCommit' | '*';
export type Operation = 'create' | 'update' | 'delete' | '*';
export type ChangeType = 'add' | 'remove' | 'update' | '*';
export type Type = string | '*';
export type Property = string | '*';

export interface SubscriptionInterface {

  // Subscribes to event patterns, returns a function that can be called to unsubscribe
  subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation,
    type: Type,
    property?: Property,
    changeType?: ChangeType
  ): () => void;

  // Subscribes a callback to be notified when the given object is updated, returns a function that can be called to unsubscribe
  subscribeToObject<T extends object>(object: T, listener: (updatedObject: T) => void): () => void;

  // Subscribes a callback to be notified when the store is updated, returns a function that can be called to unsubscribe
  subscribeToStore(listener: () => void): () => void;
}

