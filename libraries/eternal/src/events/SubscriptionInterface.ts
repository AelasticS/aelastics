import { EventPayload, Result } from './EventTypes';

export type Timing = 'before' | 'after' | 'beforeCommit' | 'afterCommit' | '*';
export type Operation = 'create' | 'update' | 'delete' | '*';
export type ChangeType = 'add' | 'remove' | 'update' | '*';
export type Type = string | '*';
export type Property = string | '*';

export interface SubscriptionInterface {
  subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation,
    type: Type,
    property?: Property,
    changeType?: ChangeType
  ): () => void;
  subscribeToObject(objectId: string, handler: (payload: EventPayload) => Result): () => void;
  subscribeToStore(callback: () => Result): () => void;
}