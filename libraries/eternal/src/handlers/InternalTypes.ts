// src/handlers/InternalTypes.ts (or MetaDefinitions.ts)
export interface EternalObject {
    uuid: string;          // Unique identifier for the object
    createdAt: number;     // Timestamp when the object was created
    nextVersion?: WeakRef<any>; // Weak reference to the next version in state history
    [key: string]: any;    // Allow additional properties with dynamic keys
}
