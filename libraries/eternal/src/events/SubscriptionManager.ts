import { EternalStore } from "../EternalStore"
import { EventEmitter2 } from "eventemitter2"
import { EventPayload, Result } from "./EventTypes"
import { SubscriptionInterface, Timing, Operation, ChangeType } from "./SubscriptionInterface"
import { ChangeLogEntry } from "./ChangeLog"
import { EternalObject } from "../handlers/InternalTypes"

export class SubscriptionManager implements SubscriptionInterface {
  private objectSubscriptions: Map<string, Set<(updatedObject: any) => void>> = new Map()
  private storeSubscriptions: Set<() => void> = new Set()
  private eventEmitter: EventEmitter2

  constructor(private readonly store: EternalStore) {
    this.eventEmitter = new EventEmitter2({
      wildcard: true,
      delimiter: ".",
    })
  }

  /** Subscribes a callback to be notified when the given object is updated */
  public subscribeToObject<T extends object>(object: T, listener: (updatedObject: T) => void): () => void {
    const objectId = (object as EternalObject).uuid
    if (!objectId) {
      throw new Error("Object does not have a UUID")
    }
    if (!this.objectSubscriptions.has(objectId)) {
      this.objectSubscriptions.set(objectId, new Set())
    }
    this.objectSubscriptions.get(objectId)!.add(listener)

    return () => {
      this.objectSubscriptions.get(objectId)!.delete(listener)
      if (this.objectSubscriptions.get(objectId)!.size === 0) {
        this.objectSubscriptions.delete(objectId)
      }
    }
  }

  /** Subscribes a callback to be notified when the store is updated */
  public subscribeToStore(callback: () => void): () => void {
    this.storeSubscriptions.add(callback)
    return () => {
      this.storeSubscriptions.delete(callback)
    }
  }

  /** Subscribes to event patterns */
  public subscribe(
    listener: (event: EventPayload) => Result,
    timing: Timing,
    operation: Operation,
    type: string | "*",
    property?: string | "*",
    changeType?: ChangeType
  ): () => void {
    let eventPattern = `${timing}.${operation}.${type}`
    if (property) {
      eventPattern += `.${property}`
    }
    if (changeType) {
      eventPattern += `.${changeType}`
    }
    this.eventEmitter.on(eventPattern, listener)
    return () => {
      this.eventEmitter.off(eventPattern, listener)
    }
  }

  /** Notifies all subscribers of updated objects */
  public notifyObjectSubscribersAfterCommit(): void {
    const changes = this.store.getState().getChangeLog()
    const notifiedObjects = new Set<string>()

    for (const change of changes) {
      if (change.objectId && !notifiedObjects.has(change.objectId)) {
        const payload: EventPayload = {
          eventType: "afterCommit.objectUpdated",
          timestamp: new Date(),
          objectId: change.objectId,
          changes: this.getObjectChanges(change.objectId),
        }
        const handlers = this.objectSubscriptions.get(change.objectId)
        if (handlers) {
          handlers.forEach((handler) => handler(payload))
        }
        notifiedObjects.add(change.objectId)
      }
    }
  }

  /** Retrieves changes for a specific object */
  public getObjectChanges(objectId: string): ChangeLogEntry[] {
    return this.store
      .getState()
      .getChangeLog()
      .filter((change) => change.objectId === objectId)
  }

  /** Emits events using EventEmitter2 and returns a Result */
  public emit(event: EventPayload): Result {
    let eventPattern = `${event.eventType}`
    // if (event.changes && event.changes.length > 0) {
    //   const change = event.changes[0]
    //   if (change.property) {
    //     eventPattern += `.${change.property}`
    //   }
    //   if (change.changeType) {
    //     eventPattern += `.${change.changeType}`
    //   }
    // }

    const listeners = this.eventEmitter.listeners(eventPattern)
    for (const listener of listeners) {
      const result: Result = (listener as unknown as (event: EventPayload) => Result)(event)
      if (!result.success) {
        return result
      }
    }
    return { success: true }
  }

  /** Notifies all subscribers of updated store */
  public notifyStoreSubscribers(): void {
    for (const callback of this.storeSubscriptions) {
      callback()
    }
  }
  // Notifies all object subscribers
  public notifyObjectSubscribers(): void {
    // throw new Error("Method not implemented.")
  }
}

// find affected subscribed objects
export function findAffectedSubscribedObjects(
  changedObjectIds: Set<string>,
  subscribedObjectIds: Set<string>,
  parentMap: Map<string, Set<string>>
): Set<string> {
  const affectedSubscribedObjects = new Set<string>()
  const queue = Array.from(changedObjectIds)
  const visited = new Set<string>()

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue // Avoid cycles
    visited.add(currentId)

    // Check if the current object is a subscribed object
    if (subscribedObjectIds.has(currentId)) {
      affectedSubscribedObjects.add(currentId)
      // If all subscribed objects are found, terminate early
      if (affectedSubscribedObjects.size === subscribedObjectIds.size) {
        break
      }
    }

    // Add parents to the queue for further traversal
    const parents = parentMap.get(currentId) || new Set()
    for (const parentId of parents) {
      if (!visited.has(parentId)) {
        queue.push(parentId)
      }
    }
  }

  return affectedSubscribedObjects
}
