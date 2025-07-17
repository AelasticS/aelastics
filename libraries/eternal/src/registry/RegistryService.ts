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
        if (!this.registry.namespaces.has(systemNamespace.qName)) {
            this.registry.namespaces.set(systemNamespace.qName, systemNamespace);
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
        // Ensure "system" is present in namespace.imports
        if (!namespace.imports.has(systemNamespace.qName)) {
            namespace.imports.set(systemNamespace.qName, ["*"]);
        }
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

    /** Import batch of namespaces into registry (allows circular imports within batch) */
    public importNamespaceBatch(namespaces: Namespace[]): void {
        if (namespaces.length === 0) {
            return; // Nothing to import
        }

        // Ensure all namespaces have system namespace in imports
        for (const namespace of namespaces) {
            if (!namespace.imports.has(systemNamespace.qName)) {
                namespace.imports.set(systemNamespace.qName, ["*"]);
            }
        }

        // Validate all namespaces as a batch
        const batchResult = this.validateNamespaceBatchForImport(namespaces);
        
        if (!batchResult.isValid) {
            throw new NamespaceImportError("Namespace batch import failed", batchResult);
        }

        // Create internal namespaces and validate resolved types for the entire batch
        const internalNamespaces = new Map<string, InternalNamespace>();
        const allErrors: string[] = [];

        // Create temporary extended registry for batch validation
        const tempRegistry: RegistryMetadata = {
            namespaces: new Map([
                ...this.registry.namespaces,
                ...namespaces.map(ns => [ns.qName, ns] as [string, Namespace])
            ]),
            name: this.registry.name,
            version: this.registry.version
        };

        // Create internal namespaces and compute resolved types using extended registry
        for (const namespace of namespaces) {
            const internalNamespace = new InternalNamespace(namespace);
            
            // Use temporary registry that includes the batch for resolution
            const resolvedTypesErrors = internalNamespace.computeResolvedTypes(tempRegistry);
            if (resolvedTypesErrors.length > 0) {
                allErrors.push(...resolvedTypesErrors.map(err => `[${namespace.qName}] ${err}`));
            }
            
            internalNamespaces.set(namespace.qName, internalNamespace);
        }

        // Check for validation errors
        if (allErrors.length > 0) {
            throw new NamespaceImportError("Namespace batch import failed: resolved types error", {
                isValid: false,
                errors: allErrors,
                warnings: []
            });
        }

        // Check for circular imports (only problematic ones, not valid ones within batch)
        const circularImportErrors = this.detectProblematicCircularImports(namespaces, tempRegistry);
        if (circularImportErrors.length > 0) {
            throw new NamespaceImportError("Namespace batch import failed: problematic circular imports", {
                isValid: false,
                errors: circularImportErrors,
                warnings: []
            });
        }

        // All validation passed - import the entire batch
        for (const namespace of namespaces) {
            this.registry.namespaces.set(namespace.qName, namespace);
            this.internalNamespaces.set(namespace.qName, internalNamespaces.get(namespace.qName)!);
        }

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

    /** Validate batch of namespaces before import */
    public validateNamespaceBatchForImport(namespaces: Namespace[]): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const namespaceNames = new Set<string>();

        // Check for duplicate namespaces within batch
        for (const namespace of namespaces) {
            if (namespaceNames.has(namespace.qName)) {
                errors.push(`Duplicate namespace '${namespace.qName}' in batch`);
            }
            namespaceNames.add(namespace.qName);

            // Validate namespace qName format
            const qNamePattern = /^\/(?!.*\/$)(?!.*\/\/)([a-zA-Z0-9_\-]+\/)*[a-zA-Z0-9_\-]+$/;
            if (!namespace.qName || !qNamePattern.test(namespace.qName)) {
                errors.push(`Invalid namespace qualified name: ${namespace.qName}`);
            }

            // Check if namespace already exists in registry
            if (this.hasNamespace(namespace.qName)) {
                errors.push(`Namespace '${namespace.qName}' already exists in registry`);
            }

            // Prevent creating namespace named 'system'
            if (namespace.qName === "system") {
                errors.push(`Namespace 'system' is reserved for system types`);
            }

            // Prevent redefining system type names
            const systemTypeNames = Array.from(systemNamespace.types.keys());
            for (const [typeName, typeMeta] of namespace.types) {
                if (systemTypeNames.includes(typeName)) {
                    errors.push(`Type name '${typeName}' conflicts with system type in namespace '${namespace.qName}'`);
                }
            }
        }

        // Create temporary registry that includes the batch for validation
        const tempRegistry: RegistryMetadata = {
            namespaces: new Map([
                ...this.registry.namespaces,
                ...namespaces.map(ns => [ns.qName, ns] as [string, Namespace])
            ]),
            name: this.registry.name,
            version: this.registry.version
        };

        // Validate parent namespace dependencies (must exist in registry or batch)
        for (const namespace of namespaces) {
            if (namespace.parentNamespace && !tempRegistry.namespaces.has(namespace.parentNamespace)) {
                errors.push(`Parent namespace '${namespace.parentNamespace}' does not exist for namespace '${namespace.qName}'`);
            }
        }

        // Validate import dependencies (must exist in registry or batch)
        for (const namespace of namespaces) {
            for (const [importedNamespacePath, importedTypes] of namespace.imports) {
                const importedNamespace = tempRegistry.namespaces.get(importedNamespacePath);
                
                if (!importedNamespace) {
                    errors.push(`Imported namespace '${importedNamespacePath}' does not exist for namespace '${namespace.qName}'`);
                    continue;
                }

                // Check if imported types are exported by the target namespace
                for (const importEntry of importedTypes) {
                    if (importEntry === '*') {
                        continue; // Wildcard import - skip validation
                    }
                    
                    const typeName = typeof importEntry === 'string' ? importEntry : importEntry.original;
                    
                    if (!importedNamespace.exports.includes(typeName)) {
                        errors.push(`Type '${typeName}' is not exported by namespace '${importedNamespacePath}' for namespace '${namespace.qName}'`);
                    }
                    
                    if (!importedNamespace.types.has(typeName)) {
                        errors.push(`Type '${typeName}' does not exist in namespace '${importedNamespacePath}' for namespace '${namespace.qName}'`);
                    }
                }
            }
        }

        // Validate individual types within each namespace (using batch context)
        for (const namespace of namespaces) {
            for (const [typeName, typeMeta] of namespace.types) {
                const typeValidation = this.validateTypeWithRegistry(typeMeta, namespace, tempRegistry);
                errors.push(...typeValidation.errors.map(err => `[${namespace.qName}] ${err}`));
                if (typeValidation.warnings) {
                    warnings.push(...typeValidation.warnings.map(warn => `[${namespace.qName}] ${warn}`));
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /** Detect problematic circular imports (but allow valid ones within batch) */
    private detectProblematicCircularImports(namespaces: Namespace[], tempRegistry: RegistryMetadata): string[] {
        const errors: string[] = [];
        
        // For now, we'll be permissive and allow circular imports within the batch
        // This method can be enhanced later to detect truly problematic patterns
        // such as imports that would create unresolvable dependencies
        
        // TODO: Implement sophisticated circular import detection that distinguishes
        // between valid circular imports (like bidirectional relationships) and
        // problematic ones (like circular initialization dependencies)
        
        return errors;
    }

    /** Validate individual type definition */
    public validateType(typeMeta: TypeMeta, contextNamespace: Namespace): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate qualified name format (must start with '/', no trailing '/', no empty segments, only valid chars)
        const qNamePattern = /^\/(?!.*\/$)(?!.*\/\/)([a-zA-Z0-9_\-]+\/)*[a-zA-Z0-9_\-]+$/;
        if (!typeMeta.qName || !qNamePattern.test(typeMeta.qName)) {
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

    /** Validate individual type definition with custom registry context */
    public validateTypeWithRegistry(typeMeta: TypeMeta, contextNamespace: Namespace, registry: RegistryMetadata): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate qualified name format (must start with '/', no trailing '/', no empty segments, only valid chars)
        const qNamePattern = /^\/(?!.*\/$)(?!.*\/\/)([a-zA-Z0-9_\-]+\/)*[a-zA-Z0-9_\-]+$/;
        if (!typeMeta.qName || !qNamePattern.test(typeMeta.qName)) {
            errors.push(`Invalid qualified name: ${typeMeta.qName}`);
        }

        // Validate based on type category
        switch (typeMeta.category) {
            case 'simple':
                this.validateSimpleTypeWithRegistry(typeMeta, contextNamespace, registry, errors, warnings);
                break;
            case 'complex':
                this.validateComplexTypeWithRegistry(typeMeta, contextNamespace, registry, errors, warnings);
                break;
            case 'special':
                this.validateSpecialTypeWithRegistry(typeMeta, contextNamespace, registry, errors, warnings);
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
            const resolvedTypeRef = this.resolveAndValidateTypeReference(propMeta.typeRef, contextNamespace);
            
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
            const baseTypeRef = this.resolveAndValidateTypeReference(typeMeta.extends, contextNamespace);
            
            if (!baseTypeRef) {
                errors.push(`Base type '${typeMeta.extends}' not found`);
            } else {
                // Check if the base type is in the registry or in the namespace being validated
                let baseType = this.getType(baseTypeRef);
                if (!baseType) {
                    // Check if the type exists in the namespace being validated
                    const namespacePath = getNamespacePath(baseTypeRef);
                    const typeName = getLocalName(baseTypeRef);
                    if (namespacePath === contextNamespace.qName && contextNamespace.types.has(typeName)) {
                        baseType = contextNamespace.types.get(typeName);
                    }
                }
                
                if (!baseType || !isObjectType(baseType)) {
                    errors.push(`Base type '${typeMeta.extends}' is not an object type`);
                } else {
                    // Check for circular inheritance
                    const circularInheritanceError = this.detectCircularInheritance(typeMeta.qName, baseTypeRef, contextNamespace);
                    if (circularInheritanceError) {
                        errors.push(circularInheritanceError);
                    }
                }
            }
        }

        // Validate inverse collections - target types must be objects
        if (typeMeta.inverseCollection) {
            for (const [propName, inverseMeta] of typeMeta.inverseCollection) {
                const targetTypeRef = this.resolveAndValidateTypeReference(inverseMeta.targetTypeQName, contextNamespace);
                
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
                let propertyFound = typeMeta.properties.has(keyProp);
                
                // If not found in current type, check inherited properties
                if (!propertyFound && typeMeta.extends) {
                    const baseTypeRef = this.resolveAndValidateTypeReference(typeMeta.extends, contextNamespace);
                    
                    if (baseTypeRef) {
                        // Check if the base type has the property (recursively through inheritance)
                        propertyFound = this.hasPropertyInInheritanceChain(baseTypeRef, keyProp, contextNamespace);
                    }
                }
                
                if (!propertyFound) {
                    errors.push(`Identity key property '${keyProp}' not found in entity '${typeMeta.qName}' or its inheritance chain`);
                }
            }
        }
    }

    /** 
     * Properly resolve and validate a type reference using all supported patterns
     * @param typeReference - The type reference to resolve (absolute, relative, parent path, etc.)
     * @param contextNamespace - The namespace context for resolution
     * @returns The resolved qualified type name, or undefined if not found
     */
    public resolveAndValidateTypeReference(typeReference: string, contextNamespace: Namespace): string | undefined {
        // First, try the comprehensive resolveTypeReference function
        let resolvedTypeRef = resolveTypeReference(typeReference, contextNamespace, this.registry);
        
        if (resolvedTypeRef) {
            // Double-check that the resolved type actually exists
            if (this.hasType(resolvedTypeRef)) {
                return resolvedTypeRef;
            }
            
            // If not in registry, check if it exists in the namespace being validated
            const namespacePath = getNamespacePath(resolvedTypeRef);
            const typeName = getLocalName(resolvedTypeRef);
            if (namespacePath === contextNamespace.qName && contextNamespace.types.has(typeName)) {
                return resolvedTypeRef;
            }
        }
        
        // If resolveTypeReference couldn't resolve it, try additional patterns for types in the namespace being validated
        if (typeReference.startsWith('/')) {
            // It's an absolute reference - check if it points to a type in the namespace being validated
            const namespacePath = getNamespacePath(typeReference);
            const typeName = getLocalName(typeReference);
            if (namespacePath === contextNamespace.qName && contextNamespace.types.has(typeName)) {
                return typeReference; // Already qualified and exists in namespace being validated
            }
        }
        
        // Special handling for system types (they may not have qualified names in resolveTypeReference)
        if (!typeReference.includes('/')) {
            // Check if it's a system type
            if (systemNamespace.types.has(typeReference)) {
                return buildQualifiedName(systemNamespace.qName, typeReference);
            }
        }
        
        return undefined;
    }

    /** 
     * Convenience method to resolve type reference with namespace path string
     * @param typeReference - The type reference to resolve
     * @param namespacePath - The namespace path as string (e.g., "/company")
     * @returns The resolved qualified type name, or undefined if not found
     */
    public resolveTypeReference(typeReference: string, namespacePath: string): string | undefined {
        const namespace = this.getNamespace(namespacePath);
        if (!namespace) {
            return undefined;
        }
        return this.resolveAndValidateTypeReference(typeReference, namespace);
    }

    /** 
     * Resolve and validate type reference with custom registry context
     * @param typeReference - The type reference to resolve
     * @param contextNamespace - The namespace context for resolution
     * @param registry - The registry to use for resolution (may include batch namespaces)
     * @returns The resolved qualified type name, or undefined if not found
     */
    public resolveAndValidateTypeReferenceWithRegistry(
        typeReference: string, 
        contextNamespace: Namespace, 
        registry: RegistryMetadata
    ): string | undefined {
        // First, try the comprehensive resolveTypeReference function with custom registry
        let resolvedTypeRef = resolveTypeReference(typeReference, contextNamespace, registry);
        
        if (resolvedTypeRef) {
            // Double-check that the resolved type actually exists in the custom registry
            if (registry.namespaces.has(getNamespacePath(resolvedTypeRef))) {
                const namespace = registry.namespaces.get(getNamespacePath(resolvedTypeRef))!;
                const typeName = getLocalName(resolvedTypeRef);
                if (namespace.types.has(typeName)) {
                    return resolvedTypeRef;
                }
            }
            
            // If not in custom registry, check if it exists in the namespace being validated
            const namespacePath = getNamespacePath(resolvedTypeRef);
            const typeName = getLocalName(resolvedTypeRef);
            if (namespacePath === contextNamespace.qName && contextNamespace.types.has(typeName)) {
                return resolvedTypeRef;
            }
        }
        
        // If resolveTypeReference couldn't resolve it, try additional patterns for types in the namespace being validated
        if (typeReference.startsWith('/')) {
            // It's an absolute reference - check if it points to a type in the custom registry
            const namespacePath = getNamespacePath(typeReference);
            const typeName = getLocalName(typeReference);
            
            if (registry.namespaces.has(namespacePath)) {
                const namespace = registry.namespaces.get(namespacePath)!;
                if (namespace.types.has(typeName)) {
                    return typeReference; // Already qualified and exists
                }
            }
        }
        
        // Special handling for system types
        if (!typeReference.includes('/')) {
            if (systemNamespace.types.has(typeReference)) {
                return buildQualifiedName(systemNamespace.qName, typeReference);
            }
        }
        
        return undefined;
    }

    /** Validate simple type with custom registry */
    private validateSimpleTypeWithRegistry(
        typeMeta: TypeMeta, 
        contextNamespace: Namespace, 
        registry: RegistryMetadata,
        errors: string[], 
        warnings: string[]
    ): void {
        // Simple types don't have complex validation requirements
    }

    /** Validate complex type with custom registry */
    private validateComplexTypeWithRegistry(
        typeMeta: TypeMeta, 
        contextNamespace: Namespace, 
        registry: RegistryMetadata,
        errors: string[], 
        warnings: string[]
    ): void {
        if (isObjectType(typeMeta)) {
            this.validateObjectTypeWithRegistry(typeMeta, contextNamespace, registry, errors, warnings);
        }
        // Add validation for other complex types (arrays, unions, etc.)
    }

    /** Validate special type with custom registry */
    private validateSpecialTypeWithRegistry(
        typeMeta: TypeMeta, 
        contextNamespace: Namespace, 
        registry: RegistryMetadata,
        errors: string[], 
        warnings: string[]
    ): void {
        // Only ObjectRefTypeMeta remains as special type
        // Validate that target type exists and is an entity
    }

    /** Validate object/entity type with custom registry */
    private validateObjectTypeWithRegistry(
        typeMeta: ObjectTypeMeta, 
        contextNamespace: Namespace, 
        registry: RegistryMetadata,
        errors: string[], 
        warnings: string[]
    ): void {
        // Validate property type references
        for (const [propName, propMeta] of typeMeta.properties) {
            const resolvedTypeRef = this.resolveAndValidateTypeReferenceWithRegistry(propMeta.typeRef, contextNamespace, registry);
            
            if (!resolvedTypeRef) {
                errors.push(`Property '${propName}' references unknown type '${propMeta.typeRef}'`);
            }
            
            // Validate that property has required optional flag
            if (propMeta.optional === undefined) {
                errors.push(`Property '${propName}' missing required 'optional' flag`);
            }
        }

        // Validate inheritance
        if (typeMeta.extends) {
            const baseTypeRef = this.resolveAndValidateTypeReferenceWithRegistry(typeMeta.extends, contextNamespace, registry);
            
            if (!baseTypeRef) {
                errors.push(`Base type '${typeMeta.extends}' not found`);
            } else {
                // Check if the base type is in the custom registry
                let baseType: TypeMeta | undefined;
                const namespacePath = getNamespacePath(baseTypeRef);
                const typeName = getLocalName(baseTypeRef);
                
                if (registry.namespaces.has(namespacePath)) {
                    const namespace = registry.namespaces.get(namespacePath)!;
                    baseType = namespace.types.get(typeName);
                }
                
                if (!baseType || !isObjectType(baseType)) {
                    errors.push(`Base type '${typeMeta.extends}' is not an object type`);
                } else {
                    // Check for circular inheritance using custom registry
                    const circularInheritanceError = this.detectCircularInheritanceWithRegistry(
                        typeMeta.qName, 
                        baseTypeRef, 
                        contextNamespace, 
                        registry
                    );
                    if (circularInheritanceError) {
                        errors.push(circularInheritanceError);
                    }
                }
            }
        }

        // Validate inverse collections - target types must be objects
        if (typeMeta.inverseCollection) {
            for (const [propName, inverseMeta] of typeMeta.inverseCollection) {
                const targetTypeRef = this.resolveAndValidateTypeReferenceWithRegistry(inverseMeta.targetTypeQName, contextNamespace, registry);
                
                if (!targetTypeRef) {
                    errors.push(`Inverse property '${propName}' references unknown target type '${inverseMeta.targetTypeQName}'`);
                } else {
                    const namespacePath = getNamespacePath(targetTypeRef);
                    const typeName = getLocalName(targetTypeRef);
                    
                    let targetType: TypeMeta | undefined;
                    if (registry.namespaces.has(namespacePath)) {
                        const namespace = registry.namespaces.get(namespacePath)!;
                        targetType = namespace.types.get(typeName);
                    }
                    
                    if (!targetType || !isObjectType(targetType)) {
                        errors.push(`Inverse property '${propName}' target type '${inverseMeta.targetTypeQName}' must be an object type`);
                    }
                }
            }
        }

        // Validate entity identity keys
        if (typeMeta.kind === 'entity' && typeMeta.identityKeys) {
            for (const keyProp of typeMeta.identityKeys) {
                let propertyFound = typeMeta.properties.has(keyProp);
                
                // If not found in current type, check inherited properties
                if (!propertyFound && typeMeta.extends) {
                    const baseTypeRef = this.resolveAndValidateTypeReferenceWithRegistry(typeMeta.extends, contextNamespace, registry);
                    
                    if (baseTypeRef) {
                        propertyFound = this.hasPropertyInInheritanceChainWithRegistry(baseTypeRef, keyProp, contextNamespace, registry);
                    }
                }
                
                if (!propertyFound) {
                    errors.push(`Identity key property '${keyProp}' not found in entity '${typeMeta.qName}' or its inheritance chain`);
                }
            }
        }
    }

    /** Detect circular inheritance with custom registry */
    private detectCircularInheritanceWithRegistry(
        startingTypeQName: string, 
        baseTypeRef: string, 
        contextNamespace: Namespace,
        registry: RegistryMetadata,
        visited: Set<string> = new Set()
    ): string | undefined {
        // Check if we've encountered the starting type again (circular inheritance)
        if (baseTypeRef === startingTypeQName) {
            const cycle = Array.from(visited).join(' -> ') + ' -> ' + startingTypeQName;
            return `Circular inheritance detected: ${cycle}`;
        }
        
        // Check if we've already visited this base type
        if (visited.has(baseTypeRef)) {
            const cycle = Array.from(visited).join(' -> ') + ' -> ' + baseTypeRef;
            return `Circular inheritance detected in chain: ${cycle}`;
        }
        
        // Add current base type to visited set
        visited.add(baseTypeRef);
        
        // Get the base type from custom registry
        let baseType: TypeMeta | undefined;
        const namespacePath = getNamespacePath(baseTypeRef);
        const typeName = getLocalName(baseTypeRef);
        
        if (registry.namespaces.has(namespacePath)) {
            const namespace = registry.namespaces.get(namespacePath)!;
            baseType = namespace.types.get(typeName);
        }
        
        // If base type doesn't exist or doesn't extend anything, no circular inheritance
        if (!baseType || baseType.category !== "complex" || !isObjectType(baseType) || !baseType.extends) {
            return undefined;
        }
        
        // Resolve the base type's base type and recursively check
        const baseBaseTypeRef = this.resolveAndValidateTypeReferenceWithRegistry(baseType.extends, contextNamespace, registry);
        if (baseBaseTypeRef) {
            return this.detectCircularInheritanceWithRegistry(startingTypeQName, baseBaseTypeRef, contextNamespace, registry, visited);
        }
        
        return undefined;
    }

    /** Helper method to check if a property exists in the inheritance chain with custom registry */
    private hasPropertyInInheritanceChainWithRegistry(
        typeRef: string, 
        propertyName: string, 
        contextNamespace: Namespace,
        registry: RegistryMetadata
    ): boolean {
        // Get the type from custom registry
        const namespacePath = getNamespacePath(typeRef);
        const typeName = getLocalName(typeRef);
        
        let type: TypeMeta | undefined;
        if (registry.namespaces.has(namespacePath)) {
            const namespace = registry.namespaces.get(namespacePath)!;
            type = namespace.types.get(typeName);
        }
        
        if (!type || type.category !== "complex" || (type.kind !== "object" && type.kind !== "entity")) {
            return false;
        }
        
        // Check if this type has the property
        if (type.properties.has(propertyName)) {
            return true;
        }
        
        // If not found and this type extends another type, check recursively
        if (type.extends) {
            const baseTypeRef = this.resolveAndValidateTypeReferenceWithRegistry(type.extends, contextNamespace, registry);
            
            if (baseTypeRef) {
                return this.hasPropertyInInheritanceChainWithRegistry(baseTypeRef, propertyName, contextNamespace, registry);
            }
        }
        
        return false;
    }

    /**
     * Detect circular inheritance in the inheritance chain
     * @param startingTypeQName - The qualified name of the type we're validating
     * @param baseTypeRef - The qualified name of the base type
     * @param contextNamespace - The namespace context for resolution
     * @param visited - Set of already visited types (for recursion tracking)
     * @returns Error message if circular inheritance detected, undefined otherwise
     */
    private detectCircularInheritance(
        startingTypeQName: string, 
        baseTypeRef: string, 
        contextNamespace: Namespace,
        visited: Set<string> = new Set()
    ): string | undefined {
        // Check if we've encountered the starting type again (circular inheritance)
        if (baseTypeRef === startingTypeQName) {
            const cycle = Array.from(visited).join(' -> ') + ' -> ' + startingTypeQName;
            return `Circular inheritance detected: ${cycle}`;
        }
        
        // Check if we've already visited this base type (should not happen with proper validation, but safety check)
        if (visited.has(baseTypeRef)) {
            const cycle = Array.from(visited).join(' -> ') + ' -> ' + baseTypeRef;
            return `Circular inheritance detected in chain: ${cycle}`;
        }
        
        // Add current base type to visited set
        visited.add(baseTypeRef);
        
        // Get the base type to check if it extends something else
        let baseType = this.getType(baseTypeRef);
        if (!baseType) {
            // Check if the type exists in the namespace being validated
            const namespacePath = getNamespacePath(baseTypeRef);
            const typeName = getLocalName(baseTypeRef);
            if (namespacePath === contextNamespace.qName && contextNamespace.types.has(typeName)) {
                baseType = contextNamespace.types.get(typeName);
            }
        }
        
        // If base type doesn't exist or doesn't extend anything, no circular inheritance
        if (!baseType || baseType.category !== "complex" || !isObjectType(baseType) || !baseType.extends) {
            return undefined;
        }
        
        // Resolve the base type's base type and recursively check
        const baseBaseTypeRef = this.resolveAndValidateTypeReference(baseType.extends, contextNamespace);
        if (baseBaseTypeRef) {
            return this.detectCircularInheritance(startingTypeQName, baseBaseTypeRef, contextNamespace, visited);
        }
        
        return undefined;
    }

    /** Helper method to check if a property exists in the inheritance chain */
    private hasPropertyInInheritanceChain(typeRef: string, propertyName: string, contextNamespace: Namespace): boolean {
        // Get the type from registry or from the namespace being validated
        let type = this.getType(typeRef);
        if (!type) {
            // Check if the type exists in the namespace being validated
            const namespacePath = getNamespacePath(typeRef);
            const typeName = getLocalName(typeRef);
            if (namespacePath === contextNamespace.qName && contextNamespace.types.has(typeName)) {
                type = contextNamespace.types.get(typeName);
            }
        }
        
        if (!type || type.category !== "complex" || (type.kind !== "object" && type.kind !== "entity")) {
            return false;
        }
        
        // Check if this type has the property
        if (type.properties.has(propertyName)) {
            return true;
        }
        
        // If not found and this type extends another type, check recursively
        if (type.extends) {
            const baseTypeRef = this.resolveAndValidateTypeReference(type.extends, contextNamespace);
            
            if (baseTypeRef) {
                return this.hasPropertyInInheritanceChain(baseTypeRef, propertyName, contextNamespace);
            }
        }
        
        return false;
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