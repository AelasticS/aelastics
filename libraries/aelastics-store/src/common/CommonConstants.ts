/*
 * Project: aelastics-store
 * Created Date: Thursday November 3rd 2022
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

import * as t from "aelastics-types"

export const prefixValue = "@@_"
export const objectStatus = "@@aelastics/status"
export const objectSync = "@@aelastics/sync"
export const objectUUID = "@@aelastics/ID"
export const objectType = "@@aelastics/type"

export type IStoreObject<P extends t.ObjectLiteral> = P & {
  readonly [objectType]: string
  readonly [objectUUID]: string
}

export function getUnderlyingType(type: t.Any | undefined): t.Any {
  if (type === undefined) {
    return undefined as any
  }
  if (type.typeCategory === "Link") {
    return getUnderlyingType((type as t.LinkType).resolveType()!)
  }
  // handle optional types
  if (type.typeCategory === "Optional") {
    return getUnderlyingType((type as t.OptionalType<any>).base)
  }
  return type
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Extend ObjectLiteral to include properties needed by immutabale store
export interface ImmutableObject extends t.ObjectLiteral {
  readonly [objectUUID]: string
  [objectStatus]: string
}



