import { PropertyMeta, RoleMeta, SchemaRegistry, TypeMeta, TypeSchema } from "./handlers/MetaDefinitions";

// Global Schema Registry
const schemaRegistry: SchemaRegistry = {
    schemas: new Map<string, TypeSchema>()
};

/**
 * Function to populate the Schema Registry from an array of JSON schema definitions.
 * @param schemaDefinitions - An array of JSON objects representing schema definitions.
 */
export function populateSchemaRegistry(schemaDefinitions: any[]): void {
    for (const schemaDef of schemaDefinitions) {
        const schema: TypeSchema = {
            qName: schemaDef.name as string,
            version: schemaDef.version as string | undefined,
            parentSchema: schemaDef.parentSchema as string | undefined,
            types: new Map(),
            roles: schemaDef.roles ? new Map() : undefined,
            export: schemaDef.export as string[] | undefined,
            import: schemaDef.import ? new Map() : undefined
        };

        // Populate types
        if (schemaDef.types && typeof schemaDef.types === 'object') {
            for (const [typeName, typeDataRaw] of Object.entries(schemaDef.types)) {
                const typeData = typeDataRaw as { 
                    properties?: Record<string, any>; 
                    extends?: string; 
                    roles?: string[];
                };

                const typeMeta: TypeMeta = {
                    qName: typeName,
                    properties: new Map(),
                    extends: typeData.extends,
                    roles: typeData.roles ?? undefined
                };

                // Populate properties
                if (typeData.properties && typeof typeData.properties === 'object') {
                    for (const [propName, propDataRaw] of Object.entries(typeData.properties)) {
                        const propData = propDataRaw as PropertyMeta;
                        const propertyMeta: PropertyMeta = {
                            qName: propName,
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
                        typeMeta.properties.set(propName, propertyMeta);
                    }
                }
                schema.types.set(typeName, typeMeta);
            }
        }

        // Populate roles
        if (schemaDef.roles && typeof schemaDef.roles === 'object') {
            for (const [roleName, roleDataRaw] of Object.entries(schemaDef.roles)) {
                const roleData = roleDataRaw as { 
                    type: string; 
                    isMandatory?: boolean; 
                    isIndependent?: boolean;
                };

                const roleMeta: RoleMeta = {
                    qName: roleName,
                    type: roleData.type,
                    isMandatory: roleData.isMandatory,
                    isIndependent: roleData.isIndependent
                };
                schema.roles?.set(roleName, roleMeta);
            }
        }

        // Populate imports
        if (schemaDef.import && typeof schemaDef.import === 'object') {
            for (const [importedSchema, importedTypesRaw] of Object.entries(schemaDef.import)) {
                const importedTypes = importedTypesRaw as string[];
                schema.import?.set(importedSchema, importedTypes);
            }
        }

        // Add schema to the global registry
        schemaRegistry.schemas.set(schema.qName, schema);
    }
}
