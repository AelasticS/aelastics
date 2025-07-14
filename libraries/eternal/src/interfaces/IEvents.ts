import { EventPayload, Result } from "../events/EventTypes";
import { Timing, Operation, Type, Property } from "./ISubscriptionManager";

export interface IEvents {
  // Event subscriptions
  subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation,
    objectType: Type,
    property?: Property
  ): () => void;
  
  // Object-specific subscriptions
  subscribeToObject<T>(object: T, listener: (updatedObject: T) => void): () => void;
  
  // Store-wide subscriptions
  subscribeToStore(listener: () => void): () => void;
}