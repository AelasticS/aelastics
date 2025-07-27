import { StoreClass } from "./StoreClass"
import { StoreObject, uuid } from "./InternalTypes"
import { PropertyMeta, getItemType } from "../registry/TypeDefinitions"
import { getClassName, isStoreObject } from "./utils"

/**
 * Centralized type validation utility for the eternal store.
 * Provides comprehensive validation for object properties, collection elements,
 * and type compatibility using the dynamic class system and registry metadata.
 */
export class TypeValidator {
  constructor(private store: StoreClass) {}

  /**
   * Validates that a store object matches the expected type reference.
   * Uses instanceof checks with dynamic classes to handle inheritance properly.
   */
  validateStoreObjectType(obj: StoreObject, expectedTypeRef: string, propertyName?: string): void {
    if (!obj || typeof obj !== 'object') {
      throw new Error(
        `Type validation failed${propertyName ? ` for property '${propertyName}'` : ''}: ` +
        `Expected object of type '${expectedTypeRef}', but received ${typeof obj}.`
      );
    }

    if (!isStoreObject(obj)) {
      throw new Error(
        `Type validation failed${propertyName ? ` for property '${propertyName}'` : ''}: ` +
        `Object must be a valid store object with UUID. Received object without store metadata.`
      );
    }

    // Check if object is registered in the store
    const registeredObj = this.store.findByUUID(obj[uuid]);
    if (!registeredObj) {
      throw new Error(
        `Type validation failed${propertyName ? ` for property '${propertyName}'` : ''}: ` +
        `Object with UUID '${obj[uuid]}' is not registered in the store.`
      );
    }

    // Validate type compatibility using dynamic class inheritance
    if (!this.isInstanceOfType(obj, expectedTypeRef)) {
      const actualType = getClassName(obj);
      throw new Error(
        `Type mismatch${propertyName ? ` for property '${propertyName}'` : ''}: ` +
        `Cannot assign object of type '${actualType}' to expected type '${expectedTypeRef}'. ` +
        `Object must be an instance of the correct type or its subtype.`
      );
    }
  }

  /**
   * Validates an object property assignment according to its property metadata.
   */
  validateObjectProperty(value: any, propertyMeta: PropertyMeta): void {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      // TODO: Add nullable/optional constraint checking from metadata
      return;
    }

    // Basic type validation
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(
        `Invalid value for property '${propertyMeta.name}'. ` +
        `Expected an object, but received ${Array.isArray(value) ? 'array' : typeof value}.`
      );
    }

    // Validate store object type if it's a store object
    if (isStoreObject(value)) {
      this.validateStoreObjectType(value, propertyMeta.typeRef, propertyMeta.name);
    } else {
      // Non-store objects should still be valid objects but warn about potential issues
      console.warn(
        `Property '${propertyMeta.name}' received a non-store object. ` +
        `This may cause issues with change tracking and persistence.`
      );
    }
  }

  /**
   * Validates elements being added to collection properties (arrays, sets, maps).
   */
  validateCollectionElement(value: any, propertyMeta: PropertyMeta, operation: string = 'add'): void {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      throw new Error(
        `Cannot ${operation} null or undefined to collection property '${propertyMeta.name}'. ` +
        `Collection elements must be valid values.`
      );
    }

    // Get the expected element type from property metadata
    const elementTypeRef = this.getCollectionElementType(propertyMeta);
    if (!elementTypeRef) {
      // If we can't determine element type, allow any value (fallback)
      return;
    }

    // Check what kind of type the element should be
    const elementTypeMeta = this.store.registry.getType(elementTypeRef);
    
    if (elementTypeMeta && (elementTypeMeta.kind === 'object' || elementTypeMeta.kind === 'entity')) {
      // Element should be a store object
      if (!isStoreObject(value)) {
        throw new Error(
          `Invalid element for collection property '${propertyMeta.name}'. ` +
          `Expected store object, but received ${typeof value}.`
        );
      }
      this.validateStoreObjectType(value, elementTypeRef, `${propertyMeta.name}[element]`);
    } else {
      // Element should be a primitive type
      this.validatePrimitiveType(value, elementTypeRef, propertyMeta.name);
    }
  }

  /**
   * Validates primitive type values.
   */
  validatePrimitiveType(value: any, expectedType: string, propertyName: string): void {
    const actualType = typeof value;
    
    let isValid = false;
    switch (expectedType) {
      case 'string':
        isValid = actualType === 'string';
        break;
      case 'number':
        isValid = actualType === 'number' && !isNaN(value);
        break;
      case 'boolean':
        isValid = actualType === 'boolean';
        break;
      default:
        // For other types, be permissive (allow any value)
        isValid = true;
    }

    if (!isValid) {
      throw new Error(
        `Type mismatch for property '${propertyName}': ` +
        `Expected ${expectedType}, but received ${actualType}.`
      );
    }
  }

  /**
   * Checks if an object is an instance of the expected type using dynamic class inheritance.
   */
  private isInstanceOfType(obj: StoreObject, expectedTypeRef: string): boolean {
    try {
      // Get the dynamic class for the expected type
      const expectedClass = this.store.getTypeClass(expectedTypeRef);
      if (!expectedClass) {
        console.warn(`Dynamic class not found for type '${expectedTypeRef}'. Skipping type validation.`);
        return true; // Be permissive if class not found
      }

      // Check if object is instance of expected class (handles inheritance)
      return obj instanceof expectedClass;
    } catch (error) {
      console.warn(`Error during type validation for '${expectedTypeRef}':`, error);
      return true; // Be permissive on errors
    }
  }

  /**
   * Extracts the element type from collection property metadata using registry lookup.
   */
  private getCollectionElementType(propertyMeta: PropertyMeta): string | null {
    // Look up the collection type in the registry
    const collectionTypeMeta = this.store.registry.getType(propertyMeta.typeRef);
    
    if (collectionTypeMeta) {
      // Use the getItemType function to get element type for arrays/sets or value type for maps
      return getItemType(collectionTypeMeta) || null;
    }

    return null; // Can't determine element type
  }

  /**
   * Validates that an object can be assigned to a property based on type metadata.
   * This is the main entry point for property assignment validation.
   */
  validatePropertyAssignment(value: any, propertyMeta: PropertyMeta): void {
    // Look up the property type in the registry
    const propertyTypeMeta = this.store.registry.getType(propertyMeta.typeRef);
    
    // Handle collection properties
    if (propertyTypeMeta && (propertyTypeMeta.kind === 'array' || propertyTypeMeta.kind === 'set' || propertyTypeMeta.kind === 'map')) {
      throw new Error(
        `Cannot directly assign to collection property '${propertyMeta.name}'. ` +
        `Use collection methods (push, add, set) to modify collections.`
      );
    }

    // Handle object properties
    if (propertyTypeMeta && (propertyTypeMeta.kind === 'object' || propertyTypeMeta.kind === 'entity')) {
      this.validateObjectProperty(value, propertyMeta);
      return;
    }

    // Handle primitive properties
    this.validatePrimitiveType(value, propertyMeta.typeRef, propertyMeta.name);
  }
}