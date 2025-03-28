import { EternalStore } from "../EternalStore";
import { EventEmitter2 } from "eventemitter2";
import { EventPayload, Result } from "./EventTypes";
import { SubscriptionInterface, Timing, Operation, Type, Property } from "./SubscriptionInterface";
import { ChangeLogEntry } from "./ChangeLog";
import { EternalObject } from "../handlers/InternalTypes";

export class SubscriptionManager implements SubscriptionInterface {
  private objectSubscriptions: Map<string, Set<(updatedObject: any) => void>> = new Map();
  private storeSubscriptions: Set<() => void> = new Set();
  private eventEmitter: EventEmitter2;

  constructor(private readonly store: EternalStore) {
    this.eventEmitter = new EventEmitter2({
      wildcard: true,
      delimiter: ".",
    });
  }

  /** Subscribes a callback to be notified when the given object is updated */
  public subscribeToObject<T extends object>(object: T, listener: (updatedObject: T) => void): () => void {
    const objectId = (object as EternalObject).uuid;
    if (!objectId) {
      throw new Error("Object does not have a UUID");
    }
    if (!this.objectSubscriptions.has(objectId)) {
      this.objectSubscriptions.set(objectId, new Set());
    }
    this.objectSubscriptions.get(objectId)!.add(listener);

    return () => {
      this.objectSubscriptions.get(objectId)!.delete(listener);
      if (this.objectSubscriptions.get(objectId)!.size === 0) {
        this.objectSubscriptions.delete(objectId);
      }
    };
  }

  /** Subscribes a callback to be notified when the store is updated */
  public subscribeToStore(callback: () => void): () => void {
    this.storeSubscriptions.add(callback);
    return () => {
      this.storeSubscriptions.delete(callback);
    };
  }

  /** Constructs an event pattern based on the provided parameters */
  private constructEventPattern(
    timing: Timing,
    operation: Operation,
    objectType: Type,
    property?: Property
  ): string {
    let pattern = `${timing}.${operation}.${objectType}`;
    if (property) {
      pattern += `.${property}`;
    }
    return pattern;
  }

  /** Subscribes to event patterns */
  public subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation,
    objectType: Type, // Added objectType parameter
    property?: Property
  ): () => void {
    // Construct the event pattern
    const eventPattern = this.constructEventPattern(timing, operation, objectType, property);

    // Register the listener with the event emitter
    this.eventEmitter.on(eventPattern, listener);

    // Return an unsubscribe function
    return () => {
      this.eventEmitter.off(eventPattern, listener);
    };
  }

  /** Notifies all subscribers of updated objects */
  public notifyObjectSubscribersAfterCommit(): void {
    const changes = this.store.getState().getChangeLog();
    const notifiedObjects = new Set<string>();

    for (const change of changes) {
      if (change.objectId && !notifiedObjects.has(change.objectId)) {
        const updatedObject = this.store.getState().getObject(change.objectId);
        if (!updatedObject) {
          continue;
        }
        const handlers = this.objectSubscriptions.get(change.objectId);
        if (handlers) {
          handlers.forEach((handler) => handler(updatedObject));
        }
        notifiedObjects.add(change.objectId);
      }
    }
  }

  /** Retrieves changes for a specific object */
  public getObjectChanges(objectId: string): ChangeLogEntry[] {
    return this.store
      .getState()
      .getChangeLog()
      .filter((change) => change.objectId === objectId);
  }

  /** Emits events using EventEmitter2 and returns a Result */
  public emit(event: EventPayload): Result {
    const eventPattern = this.constructEventPattern(event.timing, event.operation, event.objectType, event.property);
    const listeners = this.eventEmitter.listeners(eventPattern);
    for (const listener of listeners) {
      const result: Result = (listener as unknown as (event: EventPayload) => Result)(event);
      if (!result.success) {
        return result;
      }
    }
    return { success: true };
  }

  /** Notifies all subscribers of updated store */
  public notifyStoreSubscribers(): void {
    const changes = this.store.getState().getChangeLog();
    if (changes.length > 0) {
      for (const callback of this.storeSubscriptions) {
        callback();
      }
    }
  }

  // Notifies all object subscribers
  public notifyObjectSubscribers(): void {
    // throw new Error("Method not implemented.")
  }
}