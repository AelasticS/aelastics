import { Namespace } from "./NamespaceMetadata";
import { SimpleTypeMeta } from "./TypeDefinitions";

// Define standard primitive types as SimpleTypeMeta
const stringType: SimpleTypeMeta = {
    qName: "string",
    category: "simple",
    kind: "string"
};

const numberType: SimpleTypeMeta = {
    qName: "number",
    category: "simple",
    kind: "number"
};

const booleanType: SimpleTypeMeta = {
    qName: "boolean",
    category: "simple",
    kind: "boolean"
};

const dateType: SimpleTypeMeta = {
    qName: "date",
    category: "simple",
    kind: "date"
};


const nullType: SimpleTypeMeta = {
    qName: "null",
    category: "simple",
    kind: "null"
};

const undefinedType: SimpleTypeMeta = {
    qName: "undefined",
    category: "simple",
    kind: "undefined"
};

const voidType: SimpleTypeMeta = {
    qName: "void",
    category: "simple",
    kind: "void"
};

// Add more primitives as needed

export const systemNamespace: Namespace = {
    qName: "system",
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
    exports: ["string", "number", "boolean", "date", "literal", "null", "undefined", "void"],
    imports: new Map()
};
