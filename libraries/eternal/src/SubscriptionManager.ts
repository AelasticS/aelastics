import { EternalObject } from "./handlers/InternalTypes";

export class SubscriptionManager {
    private subscriptions: WeakMap<object, Set<(updatedObj: object) => void>> = new WeakMap();

    /** Subscribes a callback to be notified when the given object is updated */
    public subscribe(obj: object, callback: (updatedObj: object) => void): void {
        if (!this.subscriptions.has(obj)) {
            this.subscriptions.set(obj, new Set());
        }
        this.subscriptions.get(obj)!.add(callback);
    }

    /** Unsubscribes a callback from receiving updates for the given object */
    public unsubscribe(obj: object, callback: (updatedObj: object) => void): void {
        const callbacks = this.subscriptions.get(obj);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.subscriptions.delete(obj);
            }
        }
    }

    /** Notifies all subscribers of updated objects */
    public notifySubscribers(updatedObjects: EternalObject[]): void {
        for (const obj of updatedObjects) {
            // ✅ Retrieve subscribers for this specific object
            const callbacks = this.subscriptions.get(obj);
            if (callbacks) {
                for (const callback of callbacks) {
                    callback(obj); // ✅ Notify subscribers with updated object
                }
            }
        }
    }
}
