import { Store } from "./Store";

/** Read-only interface for accessing immutable objects in a specific state */
interface StateView {
    getObject<T>(uuid: string): T | undefined;
    index: number;
}

export class State implements StateView {
    private objectMap: Map<string, any>;
    private previousState?: State;
    private store: WeakRef<Store>;
    public index: number;

    constructor(store: Store, previousState?: State) {
        this.store = new WeakRef(store);
        this.previousState = previousState;
        this.index = previousState ? previousState.index + 1 : 0;
        this.objectMap = new Map(previousState ? previousState.objectMap : []);
    }

       /** Retrieves an object from this specific state (returns a fixed-state object) */
       public getObject<T>(uuid: string): T | undefined {
        const obj = this.objectMap.get(uuid);
        if (!obj) return undefined;

        // Return a shallow copy with a reference to this fixed state
        return this.createFixedStateObject(obj);
    }

    /** Retrieves an object without fixing it to a state (used by Store) */
    public getDynamicObject<T>(uuid: string): T | undefined {
        return this.objectMap.get(uuid); // Returns the raw object without fixing it
    }

    private createFixedStateObject<T>(obj: T): T {
        if (!obj || typeof obj !== "object") return obj;
    
        // Create a new object that retains the original prototype
        const fixedObject = Object.create(Object.getPrototypeOf(obj));
    
        // Copy all properties from the original object
        Object.assign(fixedObject, obj);
    
        // Attach a fixed state reference
        Object.defineProperty(fixedObject, 'state', {
            value: this,
            writable: false, // Ensure it cannot be changed
            enumerable: false, // Hide it from object iteration
        });
    
        return fixedObject;
    }
    
}
