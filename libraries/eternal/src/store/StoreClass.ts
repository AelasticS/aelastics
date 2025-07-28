import { __StoreSuperClass__, StoreObject, uuid, createdAt } from "./InternalTypes"
import { RegistryService } from "../registry/RegistryService"
import { TypeMeta, PropertyMeta, ObjectTypeMeta, isSimpleType, isComplexType } from "../registry/TypeDefinitions"
import { SubscriptionManager } from "../events/SubscriptionManager"
import { State } from "./State"
import { generateUUID, uniqueTimestamp, makePrivatePropertyKey, makePrivateProxyKey } from "./utils"
import { addPropertyAccessors } from "./PropertyAccessors"
import { createImmutableArray } from "../handlers/ArrayHandlers"
import { createImmutableSet } from "../handlers/SetHandlers"
import { createImmutableMap } from "../handlers/MapHandlers"
import { TypeValidator } from "./TypeValidator"

export type InternalRecipe = ((obj: StoreObject) => void) | (() => any)

export class StoreClass {
  private stateHistory: State[] = [] // Stores the history of states
  private _subscriptionManager = new SubscriptionManager(this) // Create a subscription manager
  private currentStateIndex: number = -1 // Track active state index
  private inUpdateMode: boolean = false // Flag to indicate if the store is in update mode
  private typeToClassMap: Map<string, any> = new Map() // Maps type names to dynamic classes
  private registryService: RegistryService
  private currentState: State | null = null
  public readonly validator: TypeValidator // Type validation utility

  constructor(registryService: RegistryService) {
    this.registryService = registryService
    this.initializeRegistryTypes();
    this.initializeInitialState();
    this.validator = new TypeValidator(this);
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
        if (typeMeta && isComplexType(typeMeta)) {
          this.createDynamicClass(typeMeta as ObjectTypeMeta);
        }
      }
    }
  }

  private createDynamicClass(typeMeta: ObjectTypeMeta): void {
    const className = typeMeta.qName 
    const store = this; // Capture store reference for use in class methods
    
    // Create dynamic class that extends __StoreSuperClass__
    const DynamicClass = class extends __StoreSuperClass__ {
      constructor() {
        super();
        this[uuid] = generateUUID();
        this[createdAt] = uniqueTimestamp();
        
        // Initialize properties from type metadata using private keys to bypass setters
        if (typeMeta.properties) {
          for (const [propName, propMeta] of typeMeta.properties) {
            const defaultValue = this.getDefaultValue(propMeta);
            const propTypeKind = this.getPropertyTypeKind(propMeta.typeRef);
            
            if (propTypeKind === "array") {
              const privateKey = makePrivatePropertyKey(propName);
              const proxyKey = makePrivateProxyKey(propName);
              (this as any)[privateKey] = [];
              (this as any)[proxyKey] = createImmutableArray((this as any)[privateKey], {
                store,
                object: this as any,
                propDes: propMeta,
              });
            } else if (propTypeKind === "set") {
              const privateKey = makePrivatePropertyKey(propName);
              const proxyKey = makePrivateProxyKey(propName);
              (this as any)[privateKey] = new Set();
              (this as any)[proxyKey] = createImmutableSet((this as any)[privateKey], {
                store,
                object: this as any,
                propDes: propMeta,
              });
            } else if (propTypeKind === "map") {
              const privateKey = makePrivatePropertyKey(propName);
              const proxyKey = makePrivateProxyKey(propName);
              (this as any)[privateKey] = new Map();
              (this as any)[proxyKey] = createImmutableMap((this as any)[privateKey], {
                store,
                object: this as any,
                propDes: propMeta,
              });
            } else {
              // For primitives and objects, store in private key
              const privateKey = makePrivatePropertyKey(propName);
              (this as any)[privateKey] = defaultValue;
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
        
        // Extract namespace from typeMeta.qName (e.g., "/company/Employee" -> "/company")
        const namespacePath = typeMeta.qName.substring(0, typeMeta.qName.lastIndexOf('/'));
        const contextNamespace = store.registryService.getNamespace(namespacePath);
        
        if (contextNamespace) {
          // Use enhanced registry resolution
          const resolvedTypeRef = store.registryService.resolveAndValidateTypeReference(
            propMeta.typeRef,
            contextNamespace
          );
          
          if (resolvedTypeRef) {
            const resolvedType = store.registryService.getType(resolvedTypeRef);
            if (resolvedType) {
              return this.getDefaultValueForResolvedType(resolvedType, propMeta.optional);
            }
          }
        }
        
        // Fallback to string-based detection for compatibility
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
      
      private getDefaultValueForResolvedType(resolvedType: TypeMeta, optional: boolean): any {
        if (isSimpleType(resolvedType)) {
          switch (resolvedType.kind) {
            case 'string': return optional ? undefined : '';
            case 'number': return optional ? undefined : 0;
            case 'boolean': return optional ? undefined : false;
            case 'date': return optional ? undefined : new Date();
            case 'bigint': return optional ? undefined : 0n;
            case 'null': return null;
            case 'undefined': return undefined;
            default: return optional ? undefined : null;
          }
        } else if (isComplexType(resolvedType)) {
          switch (resolvedType.kind) {
            case 'array': return []; // Arrays are always initialized
            case 'set': return new Set(); // Sets are always initialized
            case 'map': return new Map(); // Maps are always initialized
            case 'object':
            case 'entity':
              return optional ? undefined : null; // Object references
            default: return optional ? undefined : null;
          }
        }
        return optional ? undefined : null;
      }
      
      private getPropertyTypeKind(typeRef: string): string {
        // Extract namespace from typeMeta.qName
        const namespacePath = typeMeta.qName.substring(0, typeMeta.qName.lastIndexOf('/'));
        const contextNamespace = store.registryService.getNamespace(namespacePath);
        
        if (contextNamespace) {
          // Use enhanced registry resolution
          const resolvedTypeRef = store.registryService.resolveAndValidateTypeReference(
            typeRef,
            contextNamespace
          );
          
          if (resolvedTypeRef) {
            const resolvedType = store.registryService.getType(resolvedTypeRef);
            if (resolvedType) {
              if (isSimpleType(resolvedType)) {
                return "primitive";
              } else if (isComplexType(resolvedType)) {
                switch (resolvedType.kind) {
                  case 'array': return "array";
                  case 'map': return "map";
                  case 'set': return "set";
                  case 'object':
                  case 'entity':
                    return "object";
                  default: return "primitive";
                }
              }
            }
          }
        }
        
        // Fallback to string-based detection for compatibility
        if (typeRef.includes("array")) return "array";
        if (typeRef.includes("map")) return "map";
        if (typeRef.includes("set")) return "set";
        if (typeRef.includes("object")) return "object";
        return "primitive";
      }
    };
    
    // Set the class name for debugging
    Object.defineProperty(DynamicClass, 'name', { value: className });
    
    // Add property accessors for object/entity types that have properties
    if ((typeMeta.kind === 'object' || typeMeta.kind === 'entity') && typeMeta.properties) {
      addPropertyAccessors(DynamicClass.prototype, typeMeta, this);
    }
    
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

  // Enhanced create API - overloaded methods for unambiguous type resolution
  public create<T>(qualifiedNameOrTypeMeta: string | TypeMeta, initialState?: Partial<T>): T {
    let typeMeta: TypeMeta | undefined;
    
    if (typeof qualifiedNameOrTypeMeta === 'string') {
      // Handle qualified name with optimized resolution
      typeMeta = this.getTypeMetaByQualifiedName(qualifiedNameOrTypeMeta);
    } else {
      // Handle TypeMeta object directly
      typeMeta = qualifiedNameOrTypeMeta;
    }
    
    if (!typeMeta) {
      const typeIdentifier = typeof qualifiedNameOrTypeMeta === 'string' 
        ? qualifiedNameOrTypeMeta 
        : qualifiedNameOrTypeMeta.qName || 'unknown';
      throw new Error(`Type '${typeIdentifier}' not found in registry`);
    }
    
    return this.createFromTypeMeta<T>(typeMeta, initialState);
  }

  /**
   * Optimized type resolution using qualified name (e.g., "/company/Employee")
   * Directly extracts namespace path instead of iterating through all namespaces
   */
  private getTypeMetaByQualifiedName(qualifiedName: string): TypeMeta | undefined {
    // Validate qualified name format
    if (!qualifiedName.startsWith('/')) {
      throw new Error(`Invalid qualified name '${qualifiedName}'. Must start with '/' (e.g., '/company/Employee')`);
    }
    
    // Extract namespace path and type name efficiently
    const lastSlashIndex = qualifiedName.lastIndexOf('/');
    if (lastSlashIndex === 0) {
      throw new Error(`Invalid qualified name '${qualifiedName}'. Must contain at least one namespace level`);
    }
    
    const namespacePath = qualifiedName.substring(0, lastSlashIndex);
    const typeName = qualifiedName.substring(lastSlashIndex + 1);
    
    // Direct namespace lookup (O(1) instead of O(n) iteration)
    const namespace = this.registryService.getNamespace(namespacePath);
    if (!namespace) {
      return undefined; // Namespace doesn't exist
    }
    
    // Direct type lookup within namespace
    return namespace.types.get(typeName);
  }

  /**
   * Common object creation logic using TypeMeta
   */
  private createFromTypeMeta<T>(typeMeta: TypeMeta, initialState?: Partial<T>): T {
    if (!isComplexType(typeMeta)) {
      throw new Error(`Cannot create instance of simple type '${typeMeta.qName}'. Only complex types (object, entity) can be instantiated.`);
    }
    
    const objectTypeMeta = typeMeta as ObjectTypeMeta;
    if (objectTypeMeta.kind !== 'object' && objectTypeMeta.kind !== 'entity') {
      throw new Error(`Cannot create instance of type '${typeMeta.qName}' with kind '${objectTypeMeta.kind}'`);
    }
    
    const DynamicClass = this.typeToClassMap.get(typeMeta.qName);
    if (!DynamicClass) {
      throw new Error(`Dynamic class for type '${typeMeta.qName}' not found. Make sure the type is properly registered.`);
    }
    
    if (!this.currentState) {
      throw new Error('No current state available. Store may not be properly initialized.');
    }
    
    const instance = new DynamicClass();
    
    // Add to current state first (before applying initial state)
    this.currentState.addObject(instance, 'created');
    
    // Apply initial state if provided with validation
    if (initialState) {
      // Remember original update mode state
      const wasInUpdateMode = this.inUpdateMode;
      
      try {
        // Temporarily enter update mode to allow setters to work
        this.inUpdateMode = true;
        this.validateAndApplyInitialState(instance, initialState, objectTypeMeta);
      } finally {
        // Restore original update mode state
        this.inUpdateMode = wasInUpdateMode;
      }
    }
    
    return instance as T;
  }

  private validateAndApplyInitialState(instance: any, initialState: any, typeMeta: ObjectTypeMeta): void {
    if (typeof initialState !== 'object' || initialState === null) {
      throw new Error('Initial state must be an object');
    }
    
    // Validate that all provided properties exist in the type definition and apply them
    for (const [propName, value] of Object.entries(initialState)) {
      const propertyMeta = typeMeta.properties?.get(propName);
      if (!propertyMeta) {
        throw new Error(`Property '${propName}' does not exist in type '${typeMeta.qName}'`);
      }
      
      // Get property type kind to determine how to handle the value
      const propTypeKind = this.getPropertyTypeKind(propertyMeta.typeRef);
      
      if (propTypeKind === "array" || propTypeKind === "set" || propTypeKind === "map") {
        // Collection properties: cannot be set directly, must add elements to existing collection
        if (value && Array.isArray(value) && value.length > 0) {
          // Get the collection proxy that was created during object construction
          const collection = instance[propName];
          if (collection) {
            // Add each element to the collection with validation
            for (const element of value) {
              // Use TypeValidator to validate collection element types
              this.validator.validateCollectionElement(element, propertyMeta, "initial_state");
              
              // Validate that object elements are properly registered in store
              if (propTypeKind === "array" && this.isObjectElement(propertyMeta.typeRef, element)) {
                this.validateObjectIsRegistered(element, propName);
              }
              
              if (Array.isArray(collection)) {
                collection.push(element);
              } else if (collection instanceof Set) {
                collection.add(element);
              } else if (collection instanceof Map) {
                // For maps, expect element to be [key, value] tuple
                if (Array.isArray(element) && element.length === 2) {
                  collection.set(element[0], element[1]);
                }
              }
            }
          }
        }
      } else if (propTypeKind === "object") {
        // Object property: validate type and registration
        if (value !== null && value !== undefined) {
          // Use TypeValidator to validate object property type
          this.validator.validateObjectProperty(value, propertyMeta);
          // Validate that object is registered in store (only during creation)
          this.validateObjectIsRegistered(value, propName);
        }
        // Use setter to maintain inverse relationships
        instance[propName] = value;
      } else {
        // Primitive property: validate type and use setter for consistency
        if (value !== null && value !== undefined) {
          this.validator.validatePrimitiveType(value, propertyMeta.typeRef, propertyMeta.name);
        }
        instance[propName] = value;
      }
    }
  }
  
  private getPropertyTypeKind(typeRef: string): string {
    const typeMeta = this.getTypeMeta(typeRef);
    if (!typeMeta) {
      return "primitive"; // Default fallback
    }
    
    if (typeMeta.kind === 'object' || typeMeta.kind === 'entity') {
      return "object";
    }
    return typeMeta.kind;
  }
  
  private isObjectElement(typeRef: string, element: any): boolean {
    // Check if the collection contains object/entity elements
    const typeMeta = this.getTypeMeta(typeRef);
    if (!typeMeta || typeMeta.kind !== 'array') {
      return false;
    }
    
    const arrayTypeMeta = typeMeta as any; // ArrayTypeMeta
    const elementTypeMeta = this.getTypeMeta(arrayTypeMeta.elementType);
    return !!(elementTypeMeta && (elementTypeMeta.kind === 'object' || elementTypeMeta.kind === 'entity'));
  }
  
  private validateObjectIsRegistered(obj: any, propName: string): void {
    if (typeof obj !== 'object' || obj === null) {
      return; // Not an object, no validation needed
    }
    
    // Check if object has UUID (required for store objects)
    if (!obj[uuid]) {
      throw new Error(`Object assigned to property '${propName}' must have a UUID. Objects must be created through the store or imported.`);
    }
    
    // Check if object is registered in current state
    const storeObj = this.findByUUID(obj[uuid]);
    if (!storeObj) {
      throw new Error(`Object assigned to property '${propName}' with UUID '${obj[uuid]}' is not registered in the store. Objects must be created through store.create() or imported with store.import().`);
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
    if (!typeMeta || !isComplexType(typeMeta)) {
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

  public getTypeClass(typeRef: string): any {
    return this.typeToClassMap.get(typeRef);
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