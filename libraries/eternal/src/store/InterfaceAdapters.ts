import { StoreClass } from "./StoreClass";
import { IObjects, Result } from "../interfaces/IObjects";
import { TypeMeta } from "../registry/TypeDefinitions";
import { IHistory, IState, ChangeLogEntry } from "../interfaces/IHistory";
import { IData } from "../interfaces/IData";
import { IEvents } from "../interfaces/IEvents";
import { IRegistry } from "../interfaces/IRegistry";
import { EventPayload, Result as EventResult } from "../events/EventTypes";
import { Timing, Operation, Type, Property } from "../interfaces/ISubscriptionManager";
import { RegistryAdapter } from "../registry/RegistryAdapter";
import { SchemaRegistry } from "../meta/InternalSchema";
import { RegistryService } from "../registry/RegistryService";

export class ObjectsAdapter implements IObjects {
  constructor(private store: StoreClass) {}

  // Implement overloaded create methods
  create<T>(qualifiedName: string, initialState?: Partial<T>): T;
  create<T>(typeMeta: TypeMeta, initialState?: Partial<T>): T;
  create<T>(qualifiedNameOrTypeMeta: string | TypeMeta, initialState?: Partial<T>): T {
    return this.store.create<T>(qualifiedNameOrTypeMeta, initialState);
  }

  update<T>(recipe: (obj: T) => void, obj: T): T {
    return this.store.update(recipe as any, obj as any);
  }

  delete<T>(obj: T): void {
    // TODO: Implement delete functionality in StoreClass if not available
    throw new Error("Delete functionality not yet implemented");
  }

  // Implement overloaded find methods
  find<T extends object>(qualifiedName: string, predicate?: (obj: T) => boolean, state?: number): T[];
  find<T extends object>(typeMeta: TypeMeta, predicate?: (obj: T) => boolean, state?: number): T[];
  find<T extends object>(qualifiedNameOrTypeMeta: string | TypeMeta, predicate?: (obj: T) => boolean, state?: number): T[] {
    // Convert TypeMeta to qualified name if needed
    const qualifiedName = typeof qualifiedNameOrTypeMeta === 'string' 
      ? qualifiedNameOrTypeMeta 
      : qualifiedNameOrTypeMeta.qName;
    
    return this.store.find<T>(qualifiedName, predicate, state);
  }

  findByUUID<T extends object>(uuid: string, state?: number): T | undefined {
    return this.store.findByUUID<T>(uuid, state);
  }

  getUUID<T extends object>(obj: T): string {
    return this.store.getUUID(obj);
  }

  // Implement overloaded import methods
  import<T>(plainObject: any, qualifiedName: string): T;
  import<T>(plainObject: any, typeMeta: TypeMeta): T;
  import<T>(plainObject: any, qualifiedNameOrTypeMeta: string | TypeMeta): T {
    // TODO: Implement import functionality with enhanced API
    throw new Error("Import functionality not yet implemented");
  }

  export<T>(storeObject: T): any {
    // TODO: Implement export functionality
    throw new Error("Export functionality not yet implemented");
  }

  validate?<T>(obj: T): Result {
    // TODO: Implement validation
    return { success: true };
  }
}

export class HistoryAdapter implements IHistory {
  constructor(private store: StoreClass) {}

  undo(): boolean {
    return this.store.undo();
  }

  redo(): boolean {
    return this.store.redo();
  }

  getState(): IState {
    const state = this.store.getState();
    return {
      index: (this.store as any).currentStateIndex || 0,
      timestamp: state.timestamp
    };
  }

  getStateByIndex(index: number): IState {
    const state = this.store.getStateByIndex(index);
    return {
      index: index,
      timestamp: state.timestamp
    };
  }

  fromState<T>(stateIndex: number, target: string | T): T | undefined {
    return this.store.fromState<T>(stateIndex, target);
  }

  produce<T>(recipe: (obj: T) => void): IState {
    // TODO: Implement produce functionality
    throw new Error("Produce functionality not yet implemented");
  }

  isInUpdateMode(): boolean {
    return this.store.isInUpdateMode();
  }

  getAllChanges(option?: "all" | "only_modifications"): ChangeLogEntry[] {
    const changes = this.store.getAllChanges(option);
    return changes.map(change => ({
      type: (change as any).operation || 'unknown',
      timestamp: (change as any).timestamp || new Date(),
      objectId: (change as any).objectId || '',
      property: (change as any).property,
      oldValue: (change as any).oldValue,
      newValue: (change as any).newValue
    }));
  }

  consolidate(): void {
    this.store.consolidateStates();
  }

  getCurrentStateIndex(): number {
    return (this.store as any).currentStateIndex || 0;
  }

  getStateCount(): number {
    return (this.store as any).stateHistory?.length || 0;
  }
}

export class DataAdapter implements IData {
  constructor(private store: StoreClass) {}

  serialize<T>(obj: T): string {
    return this.store.serialize(obj);
  }

  deserialize<T>(json: string, type: string, validate?: boolean): T {
    const result = this.store.deserialize(json);
    
    // If type is specified and result is an object, validate it
    if (type && result && typeof result === 'object') {
      const typeMeta = this.store.getTypeMeta(type);
      if (!typeMeta) {
        throw new Error(`Type '${type}' not found in registry`);
      }
      // TODO: Add runtime validation against type metadata if validate is true
    }
    
    return result as T;
  }

  serializeBatch?<T>(objects: T[]): string {
    const batchData = objects.map(obj => this.store.export(obj));
    return JSON.stringify(batchData);
  }

  deserializeBatch?<T>(json: string): T[] {
    try {
      const batchData = JSON.parse(json);
      if (!Array.isArray(batchData)) {
        throw new Error("Expected array for batch deserialization");
      }
      
      return batchData.map(objData => {
        const imported = this.store.import(objData);
        return imported as T;
      });
    } catch (error) {
      throw new Error(`Failed to deserialize batch: ${error}`);
    }
  }
}

export class EventsAdapter implements IEvents {
  constructor(private store: StoreClass) {}

  subscribe(
    listener: (event: EventPayload) => EventResult,
    timing: Timing,
    operation: Operation,
    objectType: Type,
    property?: Property
  ): () => void {
    return this.store.subscriptionManager.subscribe(listener, timing, operation, objectType, property);
  }

  subscribeToObject<T>(object: T, listener: (updatedObject: T) => void): () => void {
    return this.store.subscriptionManager.subscribeToObject(object as any, listener as any);
  }

  subscribeToStore(listener: () => void): () => void {
    return this.store.subscriptionManager.subscribeToStore(listener);
  }
}

export class RegistryAdapterForStore {
  private registryAdapter: RegistryAdapter;
  
  constructor(private store: StoreClass) {
    // Use new registry service - create adapter from registry service
    // TODO: Create a bridge between RegistryService and RegistryAdapter
    const schemaRegistry: SchemaRegistry = {
      schemas: new Map()
    };
    this.registryAdapter = new RegistryAdapter(schemaRegistry);
  }

  getRegistry(): IRegistry {
    return this.registryAdapter;
  }
}