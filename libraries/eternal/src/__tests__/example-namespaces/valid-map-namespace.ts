import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, MapTypeMeta, SetTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";

// Valid Map pattern namespace for testing Phase 2
// Only contains Map patterns that follow the rule: Map<SimpleKey, EntityValue> ↔ EntityValue.entityProperty/Collection

// ===== COLLECTION TYPES =====

// Valid Map pattern: Map<SimpleKey, EntityValue>
const employeeByRoleMapType: MapTypeMeta = {
    qName: "/validMap/EmployeeByRoleMap",
    kind: "map",
    keyType: "string",        // Simple key ✅
    valueType: "/validMap/Employee" // Entity value ✅
};

const teamBySkillMapType: MapTypeMeta = {
    qName: "/validMap/TeamBySkillMap", 
    kind: "map",
    keyType: "string",        // Simple key ✅
    valueType: "/validMap/Employee" // Entity value ✅
};

const departmentSetType: SetTypeMeta = {
    qName: "/validMap/DepartmentSet",
    kind: "set",
    elementType: "/validMap/Department"
};

const teamSetType: SetTypeMeta = {
    qName: "/validMap/TeamSet",
    kind: "set", 
    elementType: "/validMap/Team"
};

// ===== ENTITY TYPES =====

const employeeType: ObjectTypeMeta = {
    qName: "/validMap/Employee",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["firstName", {
            name: "firstName",
            typeRef: "string",
            optional: false
        }],
        ["lastName", {
            name: "lastName",
            typeRef: "string",
            optional: false
        }],
        ["email", {
            name: "email",
            typeRef: "string",
            optional: false
        }],
        
        // Valid inverse pattern: Entity property
        ["department", { 
            name: "department",
            typeRef: "/validMap/Department",
            optional: true,
            inverseTypeRef: "/validMap/Department",
            inverseProp: "employeesByRole"
        }],
        
        // Valid inverse pattern: Entity collection
        ["teams", {
            name: "teams",
            typeRef: "/validMap/TeamSet",
            optional: true,
            inverseTypeRef: "/validMap/Team",
            inverseProp: "membersBySkill"
        }]
    ]),
    identityKeys: ["id"]
};

const departmentType: ObjectTypeMeta = {
    qName: "/validMap/Department",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["name", {
            name: "name",
            typeRef: "string",
            optional: false
        }],
        ["budget", {
            name: "budget",
            typeRef: "number",
            optional: false
        }],
        
        // Valid Map pattern: Map<SimpleKey, EntityValue> ↔ EntityValue.entityProperty
        ["employeesByRole", {
            name: "employeesByRole",
            typeRef: "/validMap/EmployeeByRoleMap",
            optional: true,
            inverseTypeRef: "/validMap/Employee",
            inverseProp: "department"
        }]
    ]),
    identityKeys: ["id"]
};

const teamType: ObjectTypeMeta = {
    qName: "/validMap/Team",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["name", {
            name: "name",
            typeRef: "string",
            optional: false
        }],
        ["project", {
            name: "project",
            typeRef: "string",
            optional: false
        }],
        
        // Valid Map pattern: Map<SimpleKey, EntityValue> ↔ EntityValue.entityCollection
        ["membersBySkill", {
            name: "membersBySkill",
            typeRef: "/validMap/TeamBySkillMap", 
            optional: true,
            inverseTypeRef: "/validMap/Employee",
            inverseProp: "teams"
        }]
    ]),
    identityKeys: ["id"]
};

// ===== NAMESPACE EXPORT =====

export const validMapNamespace: Namespace = {
    qName: "/validMap",
    version: "1.0.0",
    imports: new Map(), // Core namespace auto-imported
    types: new Map<string, TypeMeta>([
        // Collection types
        ["EmployeeByRoleMap", employeeByRoleMapType],
        ["TeamBySkillMap", teamBySkillMapType], 
        ["DepartmentSet", departmentSetType],
        ["TeamSet", teamSetType],
        
        // Entity types
        ["Employee", employeeType],
        ["Department", departmentType],
        ["Team", teamType]
    ]),
    exports: ["EmployeeByRoleMap", "TeamBySkillMap", "DepartmentSet", "TeamSet", "Employee", "Department", "Team"]
};
