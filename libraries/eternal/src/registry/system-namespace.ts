import { Namespace } from "./NamespaceMetadata";
import { SimpleTypeMeta } from "./TypeDefinitions";

// Define standard primitive types as SimpleTypeMeta
const stringType: SimpleTypeMeta = {
    qName: "/system/string",
    category: "simple",
    kind: "string"
};

const numberType: SimpleTypeMeta = {
    qName: "/system/number",
    category: "simple",
    kind: "number"
};

const booleanType: SimpleTypeMeta = {
    qName: "/system/boolean",
    category: "simple",
    kind: "boolean"
};

const dateType: SimpleTypeMeta = {
    qName: "/system/date",
    category: "simple",
    kind: "date"
};


const nullType: SimpleTypeMeta = {
    qName: "/system/null",
    category: "simple",
    kind: "null"
};

const undefinedType: SimpleTypeMeta = {
    qName: "/system/undefined",
    category: "simple",
    kind: "undefined"
};

const voidType: SimpleTypeMeta = {
    qName: "/system/void",
    category: "simple",
    kind: "void"
};

// Add more primitives as needed

export const systemNamespace: Namespace = {
    qName: "/system",
    version: "1.0.0",
    types: new Map([
        ["string", stringType],
        ["number", numberType],
        ["boolean", booleanType],
        ["date", dateType],
        ["null", nullType],
        ["undefined", undefinedType],
        ["void", voidType]
    ]),
    exports: ["string", "number", "boolean", "date", "null", "undefined", "void"],
    imports: new Map()
};
