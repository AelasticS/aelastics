import { State } from "../State";

// src/handlers/InternalTypes.ts (or MetaDefinitions.ts)
export interface EternalObject {
    uuid: string;          // Unique identifier for the object
    createdAt: number;     // Timestamp when the object was created
    nextVersion?: WeakRef<any>; // Weak reference to the next version in state history
    state?: any;           // State object that the object belongs to
   // clone(frozenToState?:State): EternalObject; // Method to clone the object
   // copyProps(newObj: any, currentPrototype: any): void
    [key: string]: any;    // Allow additional properties with dynamic keys
}

export abstract class EternalClass implements EternalObject {
    [key: string]: any;

    uuid: string = "";
    createdAt: number = 0;
    nextVersion?: WeakRef<any> | undefined;

    public clone(frozenToState?:State): EternalObject {

        // TODO check if object is frozen
        // TODO check is store in update mode
        // Create a new object with the same prototype as the current object
        const newObj = Object.create(Object.getPrototypeOf(this));
        // Copy the UUID property
        newObj.uuid = this.uuid;
        //
        newObj.state = frozenToState;
        // Copy property values from the current object to the new object
        this.copyProps(newObj, Object.getPrototypeOf(this));
        return newObj;
    }

    abstract copyProps(newObj: any, currentPrototype: any): void

}
