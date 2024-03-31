import * as t from "aelastics-types"

export const IDType = t.string.derive("uuid").length(36)
export const NameType = t.string.derive('NameType').alphanumeric.maxLength(128)
export const DescriptionType = t.string.derive('DescriptionType').maxLength(512)

export type IIDType = t.TypeOf<typeof IDType>
export type INameType = t.TypeOf<typeof NameType>
export type IDescriptionType = t.TypeOf<typeof DescriptionType>