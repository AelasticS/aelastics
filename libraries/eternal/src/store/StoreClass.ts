import { __StoreSuperClass__, StoreObject, uuid, createdAt } from "./InternalTypes"
import { RegistryService } from "../registry/RegistryService"
import { TypeMeta, PropertyMeta, ObjectTypeMeta } from "../registry/TypeDefinitions"
import { SubscriptionManager } from "../events/SubscriptionManager"
import { State } from "./State"
import { generateUUID, uniqueTimestamp } from "./utils"

export type InternalRecipe = ((obj: StoreObject) => void) | (() => any)

export class StoreClass {
  private stateHistory: State[] = [] // Stores the history of states
  private _subscriptionManager = new SubscriptionManager(this) // Create a subscription manager
  private currentStateIndex: number = -1 // Track active state index
  private inUpdateMode: boolean = false // Flag to indicate if the store is in update mode
  private typeToClassMap: Map<string, any> = new Map() // Maps type names to dynamic classes
  private registryService: RegistryService
  private currentState: State | null = null

  constructor(registryService: RegistryService) {
    this.registryService = registryService
    this.initializeRegistryTypes();
    this.initializeInitialState();
  }

  private initializeInitialState(): void {
    // Create initial state
    this.currentState = new State(this);
    this.stateHistory.push(this.currentState);
    this.currentStateIndex = 0;
  }

  private initializeRegistryTypes(): void {
    // Initialize dynamic classes from registry types
    for (const namespacePath of this.registryService.listNamespaces()) {
      const availableTypes = this.registryService.getAvailableTypesInNamespace(namespacePath);
      for (const typeName of availableTypes) {
        const typeMeta = this.registryService.getTypeInNamespace(typeName, namespacePath);
        if (typeMeta && typeMeta.category === 'complex') {
          this.createDynamicClass(typeMeta as ObjectTypeMeta);
        }
      }
    }
  }

  private createDynamicClass(typeMeta: ObjectTypeMeta): void {
    const className = typeMeta.qName.split('/').pop() || 'UnknownType';
    const store = this; // Capture store reference for use in class methods
    
    // Create dynamic class that extends __StoreSuperClass__
    const DynamicClass = class extends __StoreSuperClass__ {
      constructor() {
        super();
        this[uuid] = generateUUID();
        this[createdAt] = uniqueTimestamp();
        
        // Initialize properties from type metadata
        if (typeMeta.properties) {
          for (const [propName, propMeta] of typeMeta.properties) {
            // Initialize all properties with appropriate defaults
            const defaultValue = this.getDefaultValue(propMeta);
            (this as any)[propName] = defaultValue;
            
            // For collection properties, also initialize the private storage
            const propTypeKind = this.getPropertyTypeKind(propMeta.typeRef);
            if (propTypeKind === "array" || propTypeKind === "set" || propTypeKind === "map") {
              const privateKey = `_${propName}`;
              if (propTypeKind === "array") {
                (this as any)[privateKey] = [];
              } else if (propTypeKind === "set") {
                (this as any)[privateKey] = new Set();
              } else if (propTypeKind === "map") {
                (this as any)[privateKey] = new Map();
              }
            }
          }
        }
      }
      
      copyProps(newObj: any): void {
        if (typeMeta.properties) {
          for (const [propName] of typeMeta.properties) {
            if (this.hasOwnProperty(propName)) {
              newObj[propName] = (this as any)[propName];
            }
            
            // Also copy private property storage
            const privateKey = `_${propName}`;
            if (this.hasOwnProperty(privateKey)) {
              const value = (this as any)[privateKey];
              if (value instanceof Array) {
                newObj[privateKey] = [...value];
              } else if (value instanceof Set) {
                newObj[privateKey] = new Set(value);
              } else if (value instanceof Map) {
                newObj[privateKey] = new Map(value);
              } else {
                newObj[privateKey] = value;
              }
            }
          }
        }
      }
      
      private getDefaultValue(propMeta: PropertyMeta): any {
        if (propMeta.defaultValue !== undefined) {
          return propMeta.defaultValue;
        }
        
        const typeRef = propMeta.typeRef;
        if (typeRef.includes('string')) return propMeta.optional ? undefined : '';
        if (typeRef.includes('number')) return propMeta.optional ? undefined : 0;
        if (typeRef.includes('boolean')) return propMeta.optional ? undefined : false;
        if (typeRef.includes('date')) return propMeta.optional ? undefined : new Date();
        if (typeRef.includes('array')) return []; // Arrays are always initialized
        if (typeRef.includes('set')) return new Set(); // Sets are always initialized
        if (typeRef.includes('map')) return new Map(); // Maps are always initialized
        return propMeta.optional ? undefined : null;
      }
      
      private getPropertyTypeKind(typeRef: string): string {
        if (typeRef.includes("array")) return "array";
        if (typeRef.includes("map")) return "map";
        if (typeRef.includes("set")) return "set";
        if (typeRef.includes("object")) return "object";
        return "primitive";
      }
    };
    
    // Set the class name for debugging
    Object.defineProperty(DynamicClass, 'name', { value: className });
    
    // Store the class in the map
    this.typeToClassMap.set(typeMeta.qName, DynamicClass);
  }

  public get objectManager(): this {
    return this
  }

  public get registry(): RegistryService {
    return this.registryService
  }

  public getMeta(type: string): TypeMeta | undefined {
    return this.getTypeMeta(type);
  }

  public getTypeMeta(type: string): TypeMeta | undefined {
    // Try to get type by qualified name
    const typeMeta = this.registryService.getType(type);
    if (typeMeta) {
      return typeMeta;
    }
    
    // Try to get type by name in each namespace
    for (const namespacePath of this.registryService.listNamespaces()) {
      const localTypeMeta = this.registryService.getTypeInNamespace(type, namespacePath);
      if (localTypeMeta) {
        return localTypeMeta;
      }
    }
    
    return undefined;
  }

  public getAllAvailableTypes(): string[] {
    const types: string[] = [];
    
    // Add types from registry service
    for (const namespacePath of this.registryService.listNamespaces()) {
      const availableTypes = this.registryService.getAvailableTypesInNamespace(namespacePath);
      types.push(...Array.from(availableTypes));
    }
    
    // Remove duplicates
    return [...new Set(types)];
  }

  public addNamespace(namespacePath: string): void {
    // TODO: Add namespace dynamic class creation with new registry types
    console.log(`Adding namespace: ${namespacePath}`);
  }

  public get subscriptionManager(): SubscriptionManager {
    return this._subscriptionManager
  }

  /** Returns the UUID of a store object */
  public getUUID<T extends object>(obj: T): string {
    if (!(obj instanceof __StoreSuperClass__)) {
      throw new Error("Object is not a store object")
    }
    return (obj as any)[uuid]
  }

  public create<T>(type: string, initialState?: Partial<T>): T {
    if (!type || typeof type !== 'string') {
      throw new Error('Type must be a non-empty string');
    }
    
    const typeMeta = this.getTypeMeta(type);
    if (!typeMeta) {
      throw new Error(`Type '${type}' not found in registry`);
    }
    
    if (typeMeta.category !== 'complex') {
      throw new Error(`Cannot create instance of simple type '${type}'. Only complex types (object, entity) can be instantiated.`);
    }
    
    const objectTypeMeta = typeMeta as ObjectTypeMeta;
    if (objectTypeMeta.kind !== 'object' && objectTypeMeta.kind !== 'entity') {
      throw new Error(`Cannot create instance of type '${type}' with kind '${objectTypeMeta.kind}'`);
    }
    
    const DynamicClass = this.typeToClassMap.get(typeMeta.qName);
    if (!DynamicClass) {
      throw new Error(`Dynamic class for type '${type}' not found. Make sure the type is properly registered.`);
    }
    
    if (!this.currentState) {
      throw new Error('No current state available. Store may not be properly initialized.');
    }
    
    const instance = new DynamicClass();
    
    // Apply initial state if provided with validation
    if (initialState) {
      this.validateAndApplyInitialState(instance, initialState, objectTypeMeta);
    }
    
    // Add to current state
    this.currentState.addObject(instance, 'created');
    
    return instance as T;
  }

  private validateAndApplyInitialState(instance: any, initialState: any, typeMeta: ObjectTypeMeta): void {
    if (typeof initialState !== 'object' || initialState === null) {
      throw new Error('Initial state must be an object');
    }
    
    // Validate that all provided properties exist in the type definition
    for (const [propName, value] of Object.entries(initialState)) {
      if (!typeMeta.properties?.has(propName)) {
        throw new Error(`Property '${propName}' does not exist in type '${typeMeta.qName}'`);
      }
      
      // TODO: Add runtime type validation against PropertyMeta
      instance[propName] = value;
    }
  }

  public update<T>(recipe: InternalRecipe, obj: T): T {
    if (!this.currentState) {
      throw new Error('No current state available for update');
    }
    
    const storeObj = obj as any as StoreObject;
    this.inUpdateMode = true;
    try {
      const newVersion = this.currentState.createNewVersion(storeObj);
      
      // Apply the recipe
      if (typeof recipe === 'function') {
        if (recipe.length === 0) {
          // Recipe returns new value
          const newValue = (recipe as () => any)();
          Object.assign(newVersion, newValue);
        } else {
          // Recipe modifies object in place
          (recipe as (obj: StoreObject) => void)(newVersion);
        }
      }
      
      return newVersion as T;
    } finally {
      this.inUpdateMode = false;
    }
  }

  public import<T>(obj: T, type?: string): T {
    if (!this.currentState) {
      throw new Error('No current state available for import');
    }
    
    // If type is provided, validate against registry
    if (type) {
      const typeMeta = this.getTypeMeta(type);
      if (!typeMeta) {
        throw new Error(`Type '${type}' not found in registry`);
      }
    }
    
    const storeObj = obj as any as StoreObject;
    
    // Ensure object has required internal properties
    if (!storeObj[uuid]) {
      storeObj[uuid] = generateUUID();
    }
    if (!storeObj[createdAt]) {
      storeObj[createdAt] = uniqueTimestamp();
    }
    
    // Add to current state
    this.currentState.addObject(storeObj, 'imported');
    
    return obj;
  }

  public export<T>(storeObject: T): any {
    const obj = storeObject as any;
    const exported: any = {};
    
    // Copy all enumerable properties except internal symbols
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof key === 'string') {
        exported[key] = obj[key];
      }
    }
    
    return exported;
  }

  public deserialize(json: string): any {
    try {
      const data = JSON.parse(json);
      
      // If it's a single object with UUID, import it
      if (data && typeof data === 'object' && data[uuid]) {
        return this.import(data);
      }
      
      // If it's a collection of objects by UUID
      if (data && typeof data === 'object') {
        const importedObjects: any = {};
        for (const [objectUuid, objectData] of Object.entries(data)) {
          if (objectData && typeof objectData === 'object') {
            const imported = this.import(objectData);
            importedObjects[objectUuid] = imported;
          }
        }
        return importedObjects;
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to deserialize: ${error}`);
    }
  }

  public serialize(obj?: any): string {
    if (obj) {
      // Serialize single object
      return JSON.stringify(this.export(obj));
    }
    
    if (!this.currentState) {
      return JSON.stringify({});
    }
    
    const allObjects: any = {};
    
    // Get all objects from current state
    for (const storeObj of (this.currentState as any).objectMap.values()) {
      const exported = this.export(storeObj);
      allObjects[storeObj[uuid]] = exported;
    }
    
    return JSON.stringify(allObjects);
  }

  public undo(): boolean {
    if (this.currentStateIndex > 0) {
      this.currentStateIndex--;
      this.currentState = this.stateHistory[this.currentStateIndex];
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      this.currentStateIndex++;
      this.currentState = this.stateHistory[this.currentStateIndex];
      return true;
    }
    return false;
  }

  public clearHistory(): void {
    // Keep only the current state
    if (this.currentState) {
      this.stateHistory = [this.currentState];
      this.currentStateIndex = 0;
    }
  }

  public getAllProperties(typeName: string): Map<string, PropertyMeta> {
    const typeMeta = this.getTypeMeta(typeName);
    if (!typeMeta || typeMeta.category !== 'complex') {
      return new Map();
    }
    
    const objectTypeMeta = typeMeta as ObjectTypeMeta;
    return objectTypeMeta.properties || new Map();
  }

  public getClassByName(typeName: string): any {
    const typeMeta = this.getTypeMeta(typeName);
    if (!typeMeta) {
      throw new Error(`Type '${typeName}' not found in registry`);
    }
    
    const dynamicClass = this.typeToClassMap.get(typeMeta.qName);
    if (!dynamicClass) {
      throw new Error(`Dynamic class for type '${typeName}' not found`);
    }
    
    return dynamicClass;
  }
  
  // Additional methods needed by adapters
  public find<T extends object>(type: string, predicate?: (obj: T) => boolean, stateIndex?: number): T[] {
    const state = stateIndex !== undefined ? this.stateHistory[stateIndex] : this.currentState;
    if (!state) {
      return [];
    }
    
    const DynamicClass = this.typeToClassMap.get(type);
    if (!DynamicClass) {
      return [];
    }
    
    return state.findObjects(DynamicClass, predicate);
  }
  
  public findByUUID<T extends object>(uuid: string, stateIndex?: number): T | undefined {
    const state = stateIndex !== undefined ? this.stateHistory[stateIndex] : this.currentState;
    if (!state) {
      return undefined;
    }
    
    return state.getObject<T>(uuid);
  }
  
  public getState(): State {
    if (!this.currentState) {
      throw new Error('No current state available');
    }
    return this.currentState;
  }
  
  public getStateByIndex(index: number): State {
    if (index < 0 || index >= this.stateHistory.length) {
      throw new Error('Invalid state index');
    }
    return this.stateHistory[index];
  }
  
  public fromState<T>(stateIndex: number, target: string | T): T | undefined {
    const state = this.getStateByIndex(stateIndex);
    if (typeof target === 'string') {
      return state.getObject<T>(target);
    }
    return target;
  }
  
  public isInUpdateMode(): boolean {
    return this.inUpdateMode;
  }
  
  public getAllChanges(option?: "all" | "only_modifications"): any[] {
    if (!this.currentState) {
      return [];
    }
    return this.currentState.getChangeLog(option);
  }
  
  public consolidateStates(): void {
    // Keep only the current state and clear history
    this.clearHistory();
  }

  // Additional methods that might be expected by tests
  public toImmutable(): any {
    // TODO: Implement proper immutable object creation
    console.warn('toImmutable not yet implemented with new registry system');
    return this.currentState;
  }

  public fromImmutable(immutableState: any): void {
    // TODO: Implement proper immutable state restoration
    console.warn('fromImmutable not yet implemented with new registry system');
  }
}