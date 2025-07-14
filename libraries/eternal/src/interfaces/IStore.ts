import { StoreClass } from "../store/StoreClass"
import { Result } from "../events/EventTypes"
import { IObjects } from "./IObjects"
import { IHistory } from "./IHistory"
import { IRegistry } from "./IRegistry"
import { IData } from "./IData"
import { IEvents } from "./IEvents"

/**
 * Interface representing a Store that manages objects and their states.
 */
export interface IStore {
  // Namespace accessors
  get objects(): IObjects;     // Object lifecycle management
  get history(): IHistory;     // State and time-travel operations  
  get registry(): IRegistry;   // Type registry management
  get data(): IData;           // JSON serialization operations
  get events(): IEvents;       // Event subscription management
  
  // Store-level operations (entire store state)
  import(storeStateJson: string): void;    // Import entire store (all objects + history + metadata)
  export(): string;                        // Export entire store (all objects + history + metadata)
  
  // Utility methods
  makeEternal<T>(obj: T): T;
  makeRegular<T>(obj: T): T;
  getEternalStore(): StoreClass;   // Access to internal implementation
  validate?<T>(obj: T): Result; // validate all objects
}

export interface SchemaManager {} // schemas

export interface StoreManager  {
  serialize():string
  deserialize(json: string, validate?: boolean): void
  validate(): Result
}