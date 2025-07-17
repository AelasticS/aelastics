import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, ArrayTypeMeta, SetTypeMeta, MapTypeMeta, RecordTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";

// ===== COLLECTION TYPES =====

// Array type for order items
const orderItemArrayType: ArrayTypeMeta = {
    qName: "/ecommerce/OrderItemArray",
    category: "complex",
    kind: "array",
    elementType: "/ecommerce/OrderItem"
};

// Array type for products
const productArrayType: ArrayTypeMeta = {
    qName: "/ecommerce/ProductArray",
    category: "complex",
    kind: "array",
    elementType: "/ecommerce/Product"
};

// Set type for categories
const categorySetType: SetTypeMeta = {
    qName: "/ecommerce/CategorySet",
    category: "complex",
    kind: "set",
    elementType: "string"
};

// Map type for product attributes (key: attribute name, value: attribute value)
const productAttributeMapType: MapTypeMeta = {
    qName: "/ecommerce/ProductAttributeMap",
    category: "complex",
    kind: "map",
    keyType: "string",
    valueType: "string"
};

// Record type for inventory counts (key: warehouse location, value: count)
const inventoryRecordType: RecordTypeMeta = {
    qName: "/ecommerce/InventoryRecord",
    category: "complex",
    kind: "record",
    keyType: "string",
    valueType: "number"
};

// ===== MAIN ENTITY TYPES =====

// Customer entity
const customerType: ObjectTypeMeta = {
    qName: "/ecommerce/Customer",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["email", {
            name: "email",
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
        ["dateOfBirth", {
            name: "dateOfBirth",
            typeRef: "date",
            optional: true
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }],
        ["orders", {
            name: "orders",
            typeRef: "/ecommerce/OrderArray",
            optional: true,
            // One-to-many: Customer has many orders
            inverseProp: "customer",
            inverseTypeRef: "/ecommerce/Order",
            inverseType: "object"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable"]
};

// Product entity with all collection types
const productType: ObjectTypeMeta = {
    qName: "/ecommerce/Product",
    category: "complex",
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
        ["description", {
            name: "description",
            typeRef: "string",
            optional: true
        }],
        ["price", {
            name: "price",
            typeRef: "number",
            optional: false
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }],
        ["categories", {
            name: "categories",
            typeRef: "/ecommerce/CategorySet",
            optional: true
        }],
        ["attributes", {
            name: "attributes",
            typeRef: "/ecommerce/ProductAttributeMap",
            optional: true
        }],
        ["inventoryByLocation", {
            name: "inventoryByLocation",
            typeRef: "/ecommerce/InventoryRecord",
            optional: true
        }],
        ["orderItems", {
            name: "orderItems",
            typeRef: "/ecommerce/OrderItemArray",
            optional: true,
            // One-to-many: Product has many order items
            inverseProp: "product",
            inverseTypeRef: "/ecommerce/OrderItem",
            inverseType: "object"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Versionable"]
};

// Order entity
const orderType: ObjectTypeMeta = {
    qName: "/ecommerce/Order",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["orderNumber", {
            name: "orderNumber",
            typeRef: "string",
            optional: false
        }],
        ["orderDate", {
            name: "orderDate",
            typeRef: "date",
            optional: false
        }],
        ["totalAmount", {
            name: "totalAmount",
            typeRef: "number",
            optional: false
        }],
        ["status", {
            name: "status",
            typeRef: "string",
            optional: false
        }],
        ["customer", {
            name: "customer",
            typeRef: "/ecommerce/Customer",
            optional: false,
            // Many-to-one: Order belongs to one customer
            inverseProp: "orders",
            inverseTypeRef: "/ecommerce/Customer",
            inverseType: "array"
        }],
        ["orderItems", {
            name: "orderItems",
            typeRef: "/ecommerce/OrderItemArray",
            optional: true,
            // One-to-many: Order has many order items
            inverseProp: "order",
            inverseTypeRef: "/ecommerce/OrderItem",
            inverseType: "object"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable", "/core/Versionable"]
};

// OrderItem entity - junction entity for Order-Product relationship
const orderItemType: ObjectTypeMeta = {
    qName: "/ecommerce/OrderItem",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["quantity", {
            name: "quantity",
            typeRef: "number",
            optional: false
        }],
        ["unitPrice", {
            name: "unitPrice",
            typeRef: "number",
            optional: false
        }],
        ["totalPrice", {
            name: "totalPrice",
            typeRef: "number",
            optional: false
        }],
        ["order", {
            name: "order",
            typeRef: "/ecommerce/Order",
            optional: false,
            // Many-to-one: OrderItem belongs to one order
            inverseProp: "orderItems",
            inverseTypeRef: "/ecommerce/Order",
            inverseType: "array"
        }],
        ["product", {
            name: "product",
            typeRef: "/ecommerce/Product",
            optional: false,
            // Many-to-one: OrderItem belongs to one product
            inverseProp: "orderItems",
            inverseTypeRef: "/ecommerce/Product",
            inverseType: "array"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable"]
};

// Array type for orders (defined after Order type)
const orderArrayType: ArrayTypeMeta = {
    qName: "/ecommerce/OrderArray",
    category: "complex",
    kind: "array",
    elementType: "/ecommerce/Order"
};

// Export the ecommerce namespace with wildcard imports
export const ecommerceNamespace: Namespace = {
    qName: "/ecommerce",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["Customer", customerType],
        ["Product", productType],
        ["Order", orderType],
        ["OrderItem", orderItemType],
        ["OrderItemArray", orderItemArrayType],
        ["OrderArray", orderArrayType],
        ["ProductArray", productArrayType],
        ["CategorySet", categorySetType],
        ["ProductAttributeMap", productAttributeMapType],
        ["InventoryRecord", inventoryRecordType]
    ]),
    exports: ["Customer", "Product", "Order", "OrderItem", "OrderItemArray", "OrderArray", "ProductArray", "CategorySet", "ProductAttributeMap", "InventoryRecord"],
    imports: new Map([
        // Wildcard import - imports all exported types from company namespace
        ["/company", ["*"]]
    ])
};