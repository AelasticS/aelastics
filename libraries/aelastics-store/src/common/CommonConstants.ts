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
import { StatusValue } from "./Status"

export const prefixValue = "@@_"
export const objectStatus = "@@aelastics/status"
export const objectSync = "@@aelastics/sync"
export const objectUUID = "@@aelastics/ID"
export const objectType = "@@aelastics/type"
export const isTypeEntity = "@@aelastics/isTypeEntity"

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

export function getIDPropName(type: t.AnyObjectType) {
  return objectUUID
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Extend ObjectLiteral to include properties needed by immutabale store
export interface ImmutableObject extends t.ObjectLiteral {
  readonly [objectUUID]: string
  [objectStatus]: StatusValue
  get isDeleted():boolean
  get isUpdated():boolean
}


// Combined function to distinguish between arrays, objects, Maps, and other types
export function checkJavascriptType(value: any): 'array' | 'object' |  'map' | 'neither'{
  if (Array.isArray(value)) {
      return 'array';
    } else if (value instanceof Map) {
      return 'map';
  } else if (typeof value === 'object' && value !== null) {
      return 'object';
  } else {
      return 'neither';
  }
}

// Create a shallow copy of the object including hidden properties
export function shallowCloneObject<T>(obj: T): T {
  const copiedObj = Object.create(Object.getPrototypeOf(obj));
  Object.defineProperties(copiedObj, Object.getOwnPropertyDescriptors(obj));
  return copiedObj;
}

