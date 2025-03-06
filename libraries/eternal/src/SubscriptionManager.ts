import { EternalStore } from "./EternalStore"
import { EternalObject } from "./handlers/InternalTypes"

export class SubscriptionManager {
  private objectSubscriptions: WeakMap<object, Set<(updatedObj: object) => void>> = new WeakMap()
  private storeSubscriptions: Set<() => void> = new Set()
  constructor(private readonly store: EternalStore) {}

  /** Subscribes a callback to be notified when the given object is updated */
  public subscribeToObj(obj: object, callback: (updatedObj: object) => void): void {
    if (!this.objectSubscriptions.has(obj)) {
      this.objectSubscriptions.set(obj, new Set())
    }
    this.objectSubscriptions.get(obj)!.add(callback)
  }

  /** Unsubscribes a callback from receiving updates for the given object */
  public unsubscribeFromObj(obj: object, callback: (updatedObj: object) => void): void {
    const callbacks = this.objectSubscriptions.get(obj)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.objectSubscriptions.delete(obj)
      }
    }
  }

  /** Notifies all subscribers of updated objects */
  public notifySubscribersToObj(updatedObjects: EternalObject[]): void {
    for (const obj of updatedObjects) {
      // ✅ Retrieve subscribers for this specific object
      const callbacks = this.objectSubscriptions.get(obj)
      if (callbacks) {
        for (const callback of callbacks) {
          callback(obj) // ✅ Notify subscribers with updated object
        }
      }
    }
  }

  /** Subscribes a callback to be notified when the store is updated */
  public subscribeToStore(callback: () => void): void {
    if (callback) this.storeSubscriptions.add(callback)
  }

  /** Unsubscribes a callback from receiving updates for the store */
  public unsubscribeFromStore(callback: () => void): void {
    if (callback) this.storeSubscriptions.delete(callback)
  }

  /** Notifies all subscribers of updated store */
  public notifySubscribersToStore(): void {

        for (const callback of this.storeSubscriptions) {
          callback() // Not
        }
  }
}
