import { PropertyType } from "./PropertyDefinitions"

export interface SchemaElement {
  qName: string
  label?: string
}
export interface SchemaDescription extends SchemaElement {
  version: string
  parentSchema?: string
  types: Record<string, TypeDescription>
  roles: Record<string, RoleDescription>
  export: string[]
  import: Record<string, string[]>
}

export interface TypeDescription extends SchemaElement {
  extends?: string // Name of the base class (if subclassing is used)
  properties: Record<string, PropertyDescription>
  roles?: string[]
}

export interface PropertyDescription extends SchemaElement {
  optional?: boolean // Whether the property is optional
  type: PropertyType // Data type of the property
  itemType?: PropertyType // Data type of the items (if array, map, or set): simplePropType or ComplexPropType
  keyType?: PropertyType // Data type of the keys (if map)
  domainType?: string // Name of the property domain of
  inverseProp?: string // Name of the inverse property (if bidirectional)
  minElements?: string // Minimum elements for collection properties // TODO add collection of constrains as (self)=>boolean
  maxElements?: string // Maximum elements for collection properties
  defaultValue?: any // Default value for simple properties
}

export interface RoleDescription extends SchemaElement {
  type: string
  isMandatory?: boolean
  isIndependent?: boolean
}
