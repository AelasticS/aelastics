import { Namespace } from "./NamespaceMetadata";
import { SimpleTypeMeta } from "./TypeDefinitions";

// Define standard primitive types as SimpleTypeMeta
const stringType: SimpleTypeMeta = {
    qName: "/system/string",
    kind: "string"
};

const numberType: SimpleTypeMeta = {
    qName: "/system/number",
    kind: "number"
};

const booleanType: SimpleTypeMeta = {
    qName: "/system/boolean",
    kind: "boolean"
};

const dateType: SimpleTypeMeta = {
    qName: "/system/date",
    kind: "date"
};


const nullType: SimpleTypeMeta = {
    qName: "/system/null",
    kind: "null"
};

const undefinedType: SimpleTypeMeta = {
    qName: "/system/undefined",
    kind: "undefined"
};

const voidType: SimpleTypeMeta = {
    qName: "/system/void",
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
