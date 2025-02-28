const jsonSchemas = [
    {
        qName: "/core",
        version: "1.0",
        types: {
            "/core/Document": {
                properties: {
                    "/core/Document/title": { type: "string" },
                    "/core/Document/content": { type: "string" },
                    "/core/Document/author": { 
                        type: "object", 
                        inverseType: "/core/User",
                        inverseProp: "/core/User/documents"
                    }
                },
                roles: ["/core/Versionable", "/core/Published"]
            },
            "/core/User": {
                properties: {
                    "/core/User/name": { type: "string" },
                    "/core/User/email": { type: "string" },
                    "/core/User/documents": { 
                        type: "array", 
                        itemType: "object", 
                        inverseType: "/core/Document", 
                        inverseProp: "/core/Document/author",
                        minElements: 0,
                        maxElements: 100
                    }
                },
                roles: ["/core/Active"]
            }
        },
        roles: {
            "/core/Versionable": { type: "/core/VersioningRules", isMandatory: true },
            "/core/Published": { type: "/core/PublishMetadata", isIndependent: true },
            "/core/Active": { type: "/core/UserStatus", isMandatory: false }
        },
        export: [
            "/core/Document", 
            "/core/User", 
            "/core/Versionable"
        ],
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
                properties: {
                    "/customer/sales/Invoice/number": { type: "string" },
                    "/customer/sales/Invoice/totalAmount": { type: "number" },
                    "/customer/sales/Invoice/customer": { 
                        type: "object", 
                        inverseType: "/customer/sales/Customer", 
                        inverseProp: "/customer/sales/Customer/invoices"
                    }
                },
                roles: ["/customer/sales/Taxable"]
            },
            "/customer/sales/Customer": {
                properties: {
                    "/customer/sales/Customer/name": { type: "string" },
                    "/customer/sales/Customer/email": { type: "string" },
                    "/customer/sales/Customer/invoices": { 
                        type: "array", 
                        itemType: "object", 
                        inverseType: "/customer/sales/Invoice",
                        inverseProp: "/customer/sales/Invoice/customer",
                        minElements: 0,
                        maxElements: 50
                    }
                }
            }
        },
        roles: {
            "/customer/sales/Taxable": { type: "/customer/sales/TaxationRules", isMandatory: false }
        },
        export: [
            "/customer/sales/Invoice", 
            "/customer/sales/Customer", 
            "/customer/sales/Taxable"
        ],
        import: {
            "/core": ["/core/Document", "/core/User"]
        }
    }
];
