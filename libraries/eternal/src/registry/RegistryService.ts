import { TypeMeta, ObjectTypeMeta, isObjectType } from "./TypeDefinitions";
import { 
    Namespace, 
    RegistryMetadata, 
    ValidationResult, 
    ImportContext,
    getLocalName,
    getNamespacePath,
    buildQualifiedName,
    resolveTypeReference,
    getAvailableTypes
} from "./NamespaceMetadata";
import { InternalNamespace } from "./InternalNamespace";
import { systemNamespace } from "./system-namespace";

/** Custom error for namespace import failures */
export class NamespaceImportError extends Error {
    public validationResult: ValidationResult;
    constructor(message: string, validationResult: ValidationResult) {
        super(message);
        this.name = "NamespaceImportError";
        this.validationResult = validationResult;
    }
}

/** Registry service - provides read-only lookup and import/export operations */
export class RegistryService {
    private registry: RegistryMetadata;
    // Optimization: Map of all types by qualified name for fast lookup
    private typeIndex: Map<string, TypeMeta> = new Map();
    // Internal namespaces with resolved types optimization
    private internalNamespaces: Map<string, InternalNamespace> = new Map();

    constructor(registry: RegistryMetadata) {
        this.registry = registry;
        
        // Auto-import system namespace if not present
        if (!this.registry.namespaces.has("system")) {
            this.registry.namespaces.set("system", systemNamespace);
        }
        
        this.buildTypeIndex();
    }

    /** Build optimization index of all types by qualified name */
    private buildTypeIndex(): void {
        this.typeIndex.clear();
        
        for (const [namespacePath, namespace] of this.registry.namespaces) {
            for (const [typeName, typeMeta] of namespace.types) {
                const qualifiedName = buildQualifiedName(namespacePath, typeName);
                this.typeIndex.set(qualifiedName, typeMeta);
            }
        }
    }

    /** Refresh the type index after registry changes */
    public refreshIndex(): void {
        this.buildTypeIndex();
    }

    // ===== NAMESPACE OPERATIONS =====

    /** Get namespace by qualified path */
    public getNamespace(namespacePath: string): Namespace | undefined {
        return this.registry.namespaces.get(namespacePath);
    }

    /** Check if namespace exists */
    public hasNamespace(namespacePath: string): boolean {
        return this.registry.namespaces.has(namespacePath);
    }

    /** List all namespace paths */
    public listNamespaces(): string[] {
        return Array.from(this.registry.namespaces.keys());
    }

    /** Get child namespaces of a parent namespace */
    public getChildNamespaces(parentPath: string): string[] {
        const children: string[] = [];
        const searchPrefix = parentPath.endsWith('/') ? parentPath : parentPath + '/';
        
        for (const namespacePath of this.registry.namespaces.keys()) {
            if (namespacePath.startsWith(searchPrefix) && 
                namespacePath !== parentPath) {
                // Only direct children, not deep descendants
                const relativePath = namespacePath.substring(searchPrefix.length);
                if (!relativePath.includes('/')) {
                    children.push(namespacePath);
                }
            }
        }
        
        return children;
    }

    // ===== TYPE OPERATIONS =====

    /** Get type by qualified name (fast lookup using index) */
    public getType(qualifiedName: string): TypeMeta | undefined {
        return this.typeIndex.get(qualifiedName);
    }

    /** Get type by name within namespace context */
    public getTypeInNamespace(typeName: string, namespacePath: string): TypeMeta | undefined {
        // Use resolved types optimization if available (O(1) lookup)
        const internalNamespace = this.internalNamespaces.get(namespacePath);
        if (internalNamespace) {
            return internalNamespace.getResolvedType(typeName);
        }
        
        // Fallback to old method for non-internal namespaces
        const namespace = this.getNamespace(namespacePath);
        if (!namespace) return undefined;

        // Try local type first
        const localType = namespace.types.get(typeName);
        if (localType) {
            return localType;
        }

        // Try imported types
        const resolvedQName = resolveTypeReference(typeName, namespace, this.registry);
        if (resolvedQName) {
            return this.getType(resolvedQName);
        }

        // Try system types by simple name (always available)
        if (systemNamespace.types.has(typeName)) {
            return systemNamespace.types.get(typeName);
        }

        return undefined;
    }

    /** Check if type exists */
    public hasType(qualifiedName: string): boolean {
        return this.typeIndex.has(qualifiedName);
    }

    /** List all types in a namespace (local only) */
    public listTypesInNamespace(namespacePath: string): string[] {
        const namespace = this.getNamespace(namespacePath);
        return namespace ? Array.from(namespace.types.keys()) : [];
    }

    /** Get all available types in namespace (local + imported + system) */
    public getAvailableTypesInNamespace(namespacePath: string): Set<string> {
        // Use resolved types optimization if available (O(1) lookup)
        const internalNamespace = this.internalNamespaces.get(namespacePath);
        if (internalNamespace) {
            const availableTypes = new Set<string>(internalNamespace.getAvailableTypeNames());
            // Add system types (always available)
            for (const systemTypeName of systemNamespace.types.keys()) {
                availableTypes.add(systemTypeName);
            }
            return availableTypes;
        }
        
        // Fallback to old method for non-internal namespaces
        const namespace = this.getNamespace(namespacePath);
        const availableTypes = namespace ? getAvailableTypes(namespace, this.registry) : new Set<string>();
        
        // Add system types (always available)
        for (const systemTypeName of systemNamespace.types.keys()) {
            availableTypes.add(systemTypeName);
        }
        
        return availableTypes;
    }

    // ===== IMPORT/EXPORT OPERATIONS =====

    /** Import namespace into registry */
    public importNamespace(namespace: Namespace): void {
        const result = this.validateNamespaceForImport(namespace);
        
        if (!result.isValid) {
            throw new NamespaceImportError("Namespace import failed", result);
        }
        
        // Create internal namespace with resolved types optimization
        const internalNamespace = new InternalNamespace(namespace);
        
        // Compute resolved types and check for errors
        const resolvedTypesErrors = internalNamespace.computeResolvedTypes(this.registry);
        if (resolvedTypesErrors.length > 0) {
            throw new NamespaceImportError("Namespace import failed: resolved types error", {
                isValid: false,
                errors: resolvedTypesErrors,
                warnings: []
            });
        }
        
        // Check for circular import dependencies
        const circularImportErrors = internalNamespace.detectCircularImports(this.registry);
        if (circularImportErrors.length > 0) {
            throw new NamespaceImportError("Namespace import failed: circular import error", {
                isValid: false,
                errors: circularImportErrors,
                warnings: []
            });
        }
        
        // Store both the regular namespace and internal namespace
        this.registry.namespaces.set(namespace.qName, namespace);
        this.internalNamespaces.set(namespace.qName, internalNamespace);
        
        this.refreshIndex();
    }

    /** Export namespace from registry */
    public exportNamespace(namespacePath: string): Namespace | undefined {
        return this.getNamespace(namespacePath);
    }

    // ===== VALIDATION OPERATIONS =====

    /** Validate namespace before import */
    public validateNamespaceForImport(namespace: Namespace): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check if namespace already exists
        if (this.hasNamespace(namespace.qName)) {
            errors.push(`Namespace '${namespace.qName}' already exists`);
        }

        // Prevent creating namespace named 'system'
        if (namespace.qName === "system") {
            errors.push(`Namespace 'system' is reserved for system types`);
        }

        // Prevent redefining system type names
        const systemTypeNames = Array.from(systemNamespace.types.keys());
        for (const [typeName, typeMeta] of namespace.types) {
            if (systemTypeNames.includes(typeName)) {
                errors.push(`Type name '${typeName}' conflicts with system type`);
            }
        }

        // Validate parent namespace exists (if specified)
        if (namespace.parentNamespace && !this.hasNamespace(namespace.parentNamespace)) {
            errors.push(`Parent namespace '${namespace.parentNamespace}' does not exist`);
        }

        // Validate imports
        for (const [importedNamespacePath, importedTypes] of namespace.imports) {
            const importedNamespace = this.getNamespace(importedNamespacePath);
            
            if (!importedNamespace) {
                errors.push(`Imported namespace '${importedNamespacePath}' does not exist`);
                continue;
            }

            // Check if imported types are exported by the target namespace
            for (const importEntry of importedTypes) {
                if (importEntry === '*') {
                    // Wildcard import - skip validation (all exported types will be imported)
                    continue;
                }
                
                const typeName = typeof importEntry === 'string' ? importEntry : importEntry.original;
                
                if (!importedNamespace.exports.includes(typeName)) {
                    errors.push(`Type '${typeName}' is not exported by namespace '${importedNamespacePath}'`);
                }
                
                if (!importedNamespace.types.has(typeName)) {
                    errors.push(`Type '${typeName}' does not exist in namespace '${importedNamespacePath}'`);
                }
            }
        }

        // Validate types within namespace
        for (const [typeName, typeMeta] of namespace.types) {
            const typeValidation = this.validateType(typeMeta, namespace);
            errors.push(...typeValidation.errors);
            if (typeValidation.warnings) {
                warnings.push(...typeValidation.warnings);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /** Validate individual type definition */
    public validateType(typeMeta: TypeMeta, contextNamespace: Namespace): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate qualified name format
        if (!typeMeta.qName || !typeMeta.qName.includes('/')) {
            errors.push(`Invalid qualified name: ${typeMeta.qName}`);
        }

        // Validate based on type category
        switch (typeMeta.category) {
            case 'simple':
                this.validateSimpleType(typeMeta, contextNamespace, errors, warnings);
                break;
            case 'complex':
                this.validateComplexType(typeMeta, contextNamespace, errors, warnings);
                break;
            case 'special':
                this.validateSpecialType(typeMeta, contextNamespace, errors, warnings);
                break;
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /** Validate simple type */
    private validateSimpleType(
        typeMeta: TypeMeta, 
        contextNamespace: Namespace, 
        errors: string[], 
        warnings: string[]
    ): void {
        // Simple types don't have complex validation requirements
        // Could add validation for literal values, etc.
    }

    /** Validate complex type */
    private validateComplexType(
        typeMeta: TypeMeta, 
        contextNamespace: Namespace, 
        errors: string[], 
        warnings: string[]
    ): void {
        if (isObjectType(typeMeta)) {
            this.validateObjectType(typeMeta, contextNamespace, errors, warnings);
        }
        // Add validation for other complex types (arrays, unions, etc.)
    }

    /** Validate special type */
    private validateSpecialType(
        typeMeta: TypeMeta, 
        contextNamespace: Namespace, 
        errors: string[], 
        warnings: string[]
    ): void {
        // Only ObjectRefTypeMeta remains as special type
        // Validate that target type exists and is an entity
    }

    /** Validate object/entity type */
    private validateObjectType(
        typeMeta: ObjectTypeMeta, 
        contextNamespace: Namespace, 
        errors: string[], 
        warnings: string[]
    ): void {
        // Validate property type references
        for (const [propName, propMeta] of typeMeta.properties) {
            let resolvedTypeRef: string | undefined;
            
            // Check if typeRef is already a qualified name (starts with /)
            if (propMeta.typeRef.startsWith('/')) {
                // It's already a qualified name, check if it exists in registry OR in the namespace being validated
                if (this.hasType(propMeta.typeRef)) {
                    resolvedTypeRef = propMeta.typeRef;
                } else {
                    // Check if the type exists in the namespace being validated
                    const namespacePath = getNamespacePath(propMeta.typeRef);
                    const typeName = getLocalName(propMeta.typeRef);
                    if (namespacePath === contextNamespace.qName && contextNamespace.types.has(typeName)) {
                        resolvedTypeRef = propMeta.typeRef;
                    }
                }
            } else {
                // It's a local name, try to resolve it
                resolvedTypeRef = resolveTypeReference(propMeta.typeRef, contextNamespace, this.registry);
            }
            
            if (!resolvedTypeRef) {
                errors.push(`Property '${propName}' references unknown type '${propMeta.typeRef}'`);
            }
            
            // Validate that property has required optional flag (optimization requirement)
            if (propMeta.optional === undefined) {
                errors.push(`Property '${propName}' missing required 'optional' flag`);
            }
        }

        // Validate inheritance
        if (typeMeta.extends) {
            let baseTypeRef: string | undefined;
            
            // Check if extends is already a qualified name
            if (typeMeta.extends.startsWith('/')) {
                if (this.hasType(typeMeta.extends)) {
                    baseTypeRef = typeMeta.extends;
                }
            } else {
                baseTypeRef = resolveTypeReference(typeMeta.extends, contextNamespace, this.registry);
            }
            
            if (!baseTypeRef) {
                errors.push(`Base type '${typeMeta.extends}' not found`);
            } else {
                const baseType = this.getType(baseTypeRef);
                if (!baseType || !isObjectType(baseType)) {
                    errors.push(`Base type '${typeMeta.extends}' is not an object type`);
                }
            }
        }

        // Validate inverse collections - target types must be objects
        if (typeMeta.inverseCollection) {
            for (const [propName, inverseMeta] of typeMeta.inverseCollection) {
                let targetTypeRef: string | undefined;
                
                // Check if target type is already a qualified name
                if (inverseMeta.targetTypeQName.startsWith('/')) {
                    if (this.hasType(inverseMeta.targetTypeQName)) {
                        targetTypeRef = inverseMeta.targetTypeQName;
                    }
                } else {
                    targetTypeRef = resolveTypeReference(inverseMeta.targetTypeQName, contextNamespace, this.registry);
                }
                
                if (!targetTypeRef) {
                    errors.push(`Inverse property '${propName}' references unknown target type '${inverseMeta.targetTypeQName}'`);
                } else {
                    const targetType = this.getType(targetTypeRef);
                    if (!targetType || !isObjectType(targetType)) {
                        errors.push(`Inverse property '${propName}' target type '${inverseMeta.targetTypeQName}' must be an object type`);
                    }
                }
            }
        }

        // Validate entity identity keys
        if (typeMeta.kind === 'entity' && typeMeta.identityKeys) {
            for (const keyProp of typeMeta.identityKeys) {
                if (!typeMeta.properties.has(keyProp)) {
                    errors.push(`Identity key property '${keyProp}' not found in entity '${typeMeta.qName}'`);
                }
            }
        }
    }

    // ===== REGISTRY INFORMATION =====

    /** Get registry metadata */
    public getRegistryInfo(): RegistryMetadata {
        return this.registry;
    }

    /** Get registry statistics */
    public getRegistryStats(): {
        namespaceCount: number;
        totalTypeCount: number;
        typesByCategory: Map<string, number>;
    } {
        const typesByCategory = new Map<string, number>();
        
        for (const typeMeta of this.typeIndex.values()) {
            const category = typeMeta.category;
            typesByCategory.set(category, (typesByCategory.get(category) || 0) + 1);
        }

        return {
            namespaceCount: this.registry.namespaces.size,
            totalTypeCount: this.typeIndex.size,
            typesByCategory
        };
    }
}