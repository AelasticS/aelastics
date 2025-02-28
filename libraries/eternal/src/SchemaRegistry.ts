import { PropertyMeta, RoleMeta, SchemaRegistry, TypeMeta, TypeSchema } from "./handlers/MetaDefinitions";

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
            import: schemaDef.import ? new Map() : undefined
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
