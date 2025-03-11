import { SchemaDescription } from "../../meta/ExternalSchema";

const jsonSchemaWithSets: SchemaDescription[] = [
    {
        qName: "/core",
        version: "1.0",
        types: {
            "/core/Document": {
                qName: "/core/Document",
                properties: {
                    "/core/Document/title": { qName: "/core/Document/title", label: "title", type: "string" },
                    "/core/Document/content": { qName: "/core/Document/content", label: "content", type: "string" },
                    "/core/Document/author": { 
                        qName: "/core/Document/author", 
                        label: "author", 
                        type: "object", 
                        inverseProp: "/core/User/documents",
                        domainType: "/core/User"
                    }
                }
            },
            "/core/User": {
                qName: "/core/User",
                properties: {
                    "/core/User/name": { qName: "/core/User/name", label: "name", type: "string" },
                    "/core/User/email": { qName: "/core/User/email", label: "email", type: "string" },
                    "/core/User/documents": { 
                        qName: "/core/User/documents", 
                        label: "documents", 
                        type: "set", 
                        itemType: "object", 
                        inverseProp: "/core/Document/author",
                        domainType: "/core/Document",
                        minElements: "0",
                        maxElements: "100"
                    }
                },
                roles: ["/core/Active"]
            }
        },
        roles: {
            "/core/Versionable": { qName: "/core/Versionable", label: "Versionable", type: "/core/VersioningRules", isMandatory: true },
            "/core/Published": { qName: "/core/Published", label: "Published", type: "/core/PublishMetadata", isIndependent: true },
            "/core/Active": { qName: "/core/Active", label: "Active", type: "/core/UserStatus", isMandatory: false }
        },
        export: ["/core/Document", "/core/User", "/core/Versionable"],
        import: {
            "/external-schema": ["/external-schema/ExternalType as Ext"]
        }
    },
    {
        qName: "/customer/sales",
        version: "2.0",
        parentSchema: "/core",
        types: {
            "/customer/sales/Invoice": {
                qName: "/customer/sales/Invoice",
                properties: {
                    "/customer/sales/Invoice/number": { qName: "/customer/sales/Invoice/number", label: "number", type: "string" },
                    "/customer/sales/Invoice/totalAmount": { qName: "/customer/sales/Invoice/totalAmount", label: "totalAmount", type: "number" },
                    "/customer/sales/Invoice/customer": { 
                        qName: "/customer/sales/Invoice/customer", 
                        label: "customer", 
                        type: "object", 
                        inverseProp: "/customer/sales/Customer/invoices",
                        domainType: "/customer/sales/Customer"
                    }
                },
                roles: ["/customer/sales/Taxable"]
            },
            "/customer/sales/Customer": {
                qName: "/customer/sales/Customer",
                properties: {
                    "/customer/sales/Customer/name": { qName: "/customer/sales/Customer/name", label: "name", type: "string" },
                    "/customer/sales/Customer/email": { qName: "/customer/sales/Customer/email", label: "email", type: "string" },
                    "/customer/sales/Customer/invoices": { 
                        qName: "/customer/sales/Customer/invoices", 
                        label: "invoices", 
                        type: "set", 
                        itemType: "object", 
                        inverseProp: "/customer/sales/Invoice/customer",
                        domainType: "/customer/sales/Invoice",
                        minElements: "0",
                        maxElements: "50"
                    }
                }
            }
        },
        roles: {
            "/customer/sales/Taxable": { qName: "/customer/sales/Taxable", label: "Taxable", type: "/customer/sales/TaxationRules", isMandatory: false }
        },
        export: ["/customer/sales/Invoice", "/customer/sales/Customer", "/customer/sales/Taxable"],
        import: {
            "/core": ["/core/Document", "/core/User"]
        }
    }
];

export default jsonSchemaWithSets;