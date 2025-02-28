import { isComplexPropType, PropertyMeta, RoleMeta, SchemaRegistry, TypeMeta, TypeSchema } from "./handlers/MetaDefinitions";

// Global Schema Registry
const schemaRegistry: SchemaRegistry = {
    schemas: new Map<string, TypeSchema>()
};

/**
 * Extracts the local name from a fully qualified name (qName).
 * Example: "/core/Document" → "Document"
 * @param qName - Fully qualified name
 * @returns Local name
 */
export function getLocalName(qName: string): string {
    return qName.split('/').pop() ?? qName;
}


/**
 * Function to populate the Schema Registry from an array of JSON schema definitions.
 * @param schemaDefinitions - An array of JSON objects representing schema definitions.
 */
export function populateSchemaRegistry(schemaDefinitions: any[]): void {
    for (const schemaDef of schemaDefinitions) {
        const schema: TypeSchema = {
            qName: schemaDef.qName as string,
            label: schemaDef.label ?? getLocalName(schemaDef.qName),
            version: schemaDef.version as string | undefined,
            parentSchema: schemaDef.parentSchema as string | undefined,
            types: new Map(),
            roles: schemaDef.roles ? new Map() : undefined,
            export: schemaDef.export as string[] | undefined,
            import: schemaDef.import ? new Map() : undefined,
            resolvedTypes: new Map()
        };

        // Populate types
        if (schemaDef.types && typeof schemaDef.types === 'object') {
            for (const [typeQName, typeDataRaw] of Object.entries(schemaDef.types)) {
                const typeData = typeDataRaw as {
                    properties?: Record<string, any>;
                    extends?: string;
                    roles?: string[];
                    label?: string;
                };

                const typeMeta: TypeMeta = {
                    qName: typeQName,
                    label: typeData.label ?? getLocalName(typeQName),
                    properties: new Map(),
                    extends: typeData.extends,
                    roles: typeData.roles ?? undefined
                };

                // Populate properties
                if (typeData.properties && typeof typeData.properties === 'object') {
                    for (const [propQName, propDataRaw] of Object.entries(typeData.properties)) {
                        const propData = propDataRaw as PropertyMeta;
                        const propertyMeta: PropertyMeta = {
                            qName: propQName,
                            label: propData.label ?? getLocalName(propQName),
                            optional: propData.optional,
                            type: propData.type,
                            itemType: propData.itemType,
                            keyType: propData.keyType,
                            inverseType: propData.inverseType,
                            inverseProp: propData.inverseProp,
                            minElements: propData.minElements,
                            maxElements: propData.maxElements,
                            defaultValue: propData.defaultValue
                        };
                        typeMeta.properties.set(propQName, propertyMeta);
                    }
                }
                schema.types.set(typeQName, typeMeta);
                schema.resolvedTypes!.set(typeQName, typeMeta);
            }
        }

        // Populate roles
        if (schemaDef.roles && typeof schemaDef.roles === 'object') {
            for (const [roleQName, roleDataRaw] of Object.entries(schemaDef.roles)) {
                const roleData = roleDataRaw as {
                    type: string;
                    isMandatory?: boolean;
                    isIndependent?: boolean;
                    label?: string;
                };

                const roleMeta: RoleMeta = {
                    qName: roleQName,
                    label: roleData.label ?? getLocalName(roleQName),
                    type: roleData.type,
                    isMandatory: roleData.isMandatory,
                    isIndependent: roleData.isIndependent
                };
                schema.roles?.set(roleQName, roleMeta);
            }
        }

        // Populate imports
        if (schemaDef.import && typeof schemaDef.import === 'object') {
            for (const [importedSchemaQName, importedTypesRaw] of Object.entries(schemaDef.import)) {
                const importedTypes = importedTypesRaw as string[];
                schema.import?.set(importedSchemaQName, importedTypes);
            }
        }

        // Add schema to the global registry
        schemaRegistry.schemas.set(schema.qName, schema);
    }
}

function computeResolvedTypes(schema: TypeSchema, schemaRegistry: SchemaRegistry): string[] {
    const errors: string[] = []; // Define errors array

    // Ensure resolvedTypes exists and already contains local types
    if (!schema.resolvedTypes) {
        schema.resolvedTypes = new Map(schema.types); // Start with local types
    }

    if (!schema.import) return errors; // No imports to process

    for (const [importedSchemaQName, importedEntries] of schema.import.entries()) {
        const importedSchema = schemaRegistry.schemas.get(importedSchemaQName);
        if (!importedSchema) continue; // Skip if schema is missing

        if (importedEntries.includes("*")) {
            // Ensure 'export' exists before iterating
            if (!importedSchema.export) continue;
            
            // Import all exported types
            for (const exportedTypeQName of importedSchema.export) {
                if (!schema.resolvedTypes.has(exportedTypeQName) && importedSchema.types.has(exportedTypeQName)) {
                    schema.resolvedTypes.set(exportedTypeQName, importedSchema.types.get(exportedTypeQName)!);
                }
            }
        } else {
            // Import specific types and handle aliases
            for (const importEntry of importedEntries) {
                if (typeof importEntry === "string") {
                    // Check that the imported type is exported
                    if (
                        !schema.resolvedTypes.has(importEntry) &&
                        importedSchema.types.has(importEntry) &&
                        importedSchema.export?.includes(importEntry) 
                    ) {
                        schema.resolvedTypes.set(importEntry, importedSchema.types.get(importEntry)!);
                    } else {
                        errors.push(`Type "${importEntry}" is not exported by schema "${importedSchemaQName}".`);
                    }
                } else {
                    // Handle aliasing { original, alias }
                    const { original, alias } = importEntry;

                    if (schema.resolvedTypes.has(alias)) {
                        errors.push(`Duplicate alias "${alias}" detected in schema "${schema.qName}".`);
                    } else if (
                        importedSchema.types.has(original) &&
                        importedSchema.export?.includes(original)
                    ) {
                        schema.resolvedTypes.set(alias, importedSchema.types.get(original)!);
                    } else {
                        errors.push(`Aliased type "${original}" not found in schema "${importedSchemaQName}".`);
                    }
                }
            }
        }
    }

    return errors; // Return errors array for further processing
}




/**
 * Verifies the consistency of an imported schema within the schema registry.
 * Ensures that all imports exist, types and roles are valid, and no conflicts arise.
 * @param schemaQName - The fully qualified name (qName) of the schema to validate.
 * @returns A list of validation errors (empty if valid).
 */
export function verifySchemaConsistency(schemaQName: string, schemaRegistry: SchemaRegistry): string[] {
    const errors: string[] = [];
    const schema = schemaRegistry.schemas.get(schemaQName);

    if (!schema) {
        errors.push(`Schema "${schemaQName}" not found in registry.`);
        return errors;
    }
    // Ensure `types` is defined
    if (!schema.types) {
        errors.push(`Schema "${schemaQName}" is malformed: Missing 'types' definition.`);
        return errors;
    }
    // Check if all imported schemas exist
    if (schema.import) {
        for (const [importedSchemaQName, importedEntities] of schema.import.entries()) {
            const importedSchema = schemaRegistry.schemas.get(importedSchemaQName);
            if (!importedSchema) {
                errors.push(`Imported schema "${importedSchemaQName}" not found in registry.`);
                continue;
            }

            // Validate imported types and roles exist in the imported schema
            for (const entity of importedEntities) {
                const entityQName = entity.split(" as ")[0]; // Remove alias if present

                if (
                    !importedSchema.types?.has(entityQName) &&
                    !importedSchema.roles?.has(entityQName)
                ) {
                    errors.push(
                        `Entity "${entityQName}" imported from "${importedSchemaQName}" does not exist.`
                    );
                }
            }
        }
    }

    // Check for duplicate exports (conflicting definitions)
    for (const [otherSchemaQName, otherSchema] of schemaRegistry.schemas.entries()) {
        if (otherSchemaQName === schemaQName) continue;

        if (otherSchema.export) {
            for (const exportedEntity of otherSchema.export) {
                if (schema.export?.includes(exportedEntity)) {
                    errors.push(
                        `Conflict: Entity "${exportedEntity}" is exported by both "${schemaQName}" and "${otherSchemaQName}".`
                    );
                }
            }
        }
    }

    // Validate properties (type references, inverse relationships, min/max constraints)
    for (const [typeQName, typeMeta] of schema.types.entries()) {
        for (const [propQName, propMeta] of typeMeta.properties.entries()) {
            // Ensure the property type exists if it's a reference
            if (isComplexPropType(propMeta.type)) {
                if (
                    propMeta.type === "object" &&
                    !schemaRegistry.schemas.get(schemaQName)?.types?.has(propMeta.inverseType!)
                ) {
                    errors.push(`Property "${propQName}" refers to unknown type "${propMeta.inverseType}".`);
                }

                if (
                    propMeta.type === "map" &&
                    propMeta.keyType &&
                    !["string", "number", "boolean"].includes(propMeta.keyType)
                ) {
                    errors.push(`Property "${propQName}" has invalid key type "${propMeta.keyType}".`);
                }
            }

            // Validate inverse relationships (if inverseType and inverseProp are defined)
            if (propMeta.inverseType && propMeta.inverseProp) {
                const inverseTypeMeta = schemaRegistry.schemas.get(schemaQName)?.types?.get(propMeta.inverseType);
                if (!inverseTypeMeta) {
                    errors.push(`Property "${propQName}" has inverseType "${propMeta.inverseType}", but it does not exist.`);
                } else {
                    const inversePropMeta = inverseTypeMeta.properties.get(propMeta.inverseProp);
                    if (!inversePropMeta) {
                        errors.push(`Property "${propQName}" declares inverseProp "${propMeta.inverseProp}", but it does not exist in "${propMeta.inverseType}".`);
                    } else if (inversePropMeta.inverseType !== typeQName || inversePropMeta.inverseProp !== propQName) {
                        errors.push(`Inverse mismatch: Property "${propQName}" → "${propMeta.inverseType}" does not correctly link back to "${typeQName}".`);
                    }
                }
            }

            // Validate min/max constraints
            if (propMeta.minElements !== undefined && propMeta.maxElements !== undefined) {
                if (propMeta.maxElements !== undefined && propMeta.minElements > propMeta.maxElements) {
                    errors.push(
                        `Property "${propQName}" has minElements=${propMeta.minElements} but maxElements=${propMeta.maxElements} (invalid).`
                    );
                }
            }
        }
    }

    // Check for circular dependencies in imports
    const visitedSchemas = new Set<string>();

    function detectCircularDependency(currentSchemaQName: string): boolean {
        if (visitedSchemas.has(currentSchemaQName)) {
            errors.push(`Circular dependency detected in schema imports: "${currentSchemaQName}".`);
            return true;
        }
        visitedSchemas.add(currentSchemaQName);

        const currentSchema = schemaRegistry.schemas.get(currentSchemaQName);
        if (currentSchema?.import) {
            for (const importedSchemaQName of currentSchema.import.keys()) {
                if (detectCircularDependency(importedSchemaQName)) {
                    return true;
                }
            }
        }

        visitedSchemas.delete(currentSchemaQName);
        return false;
    }

    detectCircularDependency(schemaQName);

    // Check for circular subclassing in types
    function detectCircularSubclassing(typeQName: string, path: Set<string>): boolean {
        if (path.has(typeQName)) {
            errors.push(`Circular inheritance detected in type hierarchy: "${Array.from(path).join(" → ")} → ${typeQName}".`);
            return true;
        }

        const typeMeta = schema?.types.get(typeQName);
        if (!typeMeta?.extends) return false;

        path.add(typeQName);
        const parentType = typeMeta.extends;
        if (!schema?.types.has(parentType)) {
            errors.push(`Type "${typeQName}" extends "${parentType}", but "${parentType}" does not exist.`);
        } else {
            detectCircularSubclassing(parentType, path);
        }
        path.delete(typeQName);
        return false;
    }

    for (const typeQName of schema.types.keys()) {
        detectCircularSubclassing(typeQName, new Set());
    }

    return errors;
}
