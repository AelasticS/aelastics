/*
 * Copyright (c) AelasticS 2020.
 */

import { InterfaceDecl, ObjectType } from "./ObjectType"
import { DefaultSchema, TypeSchema } from "../type/TypeSchema"
import { ServiceError } from "aelastics-result"
import { LinkType } from "../special-types/LinkType"
import { ArrayType } from "./ArrayType"
import { OptionalType } from "../special-types/Optional"
import { Any } from "../common/DefinitionAPI"
import { TypeCategory } from "../type/TypeDefinisions"

/**
 * entity type is the same as object type
 */
export type EntityType<P extends InterfaceDecl, I extends readonly string[]> = ObjectType<P, I>

export const entity = <P extends InterfaceDecl, I extends readonly string[]>(
  props: P,
  keys: I,
  name?: string,
  schema: TypeSchema = DefaultSchema
): EntityType<P, I> => {
  if (name === undefined || name === "") name = schema.generateName("Entity")
  return new ObjectType<P, I>(name, props, keys, schema)
}

export function findTypeCategory(fp: Any /*, type: ObjectType<any, any>, prop: string*/): TypeCategory | undefined {
  if (fp instanceof LinkType) {
    let linkedType = fp.resolveType()
    if (linkedType === undefined) {
      return undefined
    } else {
      return findTypeCategory(linkedType /*, type, prop*/)
    }
  } else if (fp instanceof OptionalType) {
    return findTypeCategory(fp.base /*, type, prop*/)
  }
  return fp.typeCategory
}

export function findBaseType(fp: Any, type: ObjectType<any, any>, prop: string): ObjectType<any, any> {
  // handle link types
  if (fp instanceof LinkType) {
    let linkedType = fp.resolveType()
    if (linkedType === undefined) {
      throw new ServiceError("ValidationError", `Property '${prop}' on type '${type.name}' is not a valid link.`)
    } else {
      return findBaseType(linkedType, type, prop)
    }
  }
  // handle optional types
  if (fp instanceof OptionalType) {
    return findBaseType(fp.base, type, prop)
  }

  // handle collections
  if (fp instanceof ArrayType /*|| fp instanceof MapTypeC*/) {
    fp = fp.element
    return findBaseType(fp, type, prop)
  }

  // check that props are object types
  if (!(fp instanceof ObjectType)) {
    throw new ServiceError("ValidationError", `Property '${prop}' on type '${type.name}' not object or entity type.`)
  }
  return fp
}
/**
 *
 * @param firstType
 * @param firstProp
 * @param secondType
 * @param secondProp
 */
export const inverseProps = (
  firstType: ObjectType<any, any>,
  firstProp: string,
  secondType: ObjectType<any, any>,
  secondProp: string
) => {
  // tslint:disable-next-line:no-constant-condition
  // check that props exist
  // let fp = firstType.interfaceDecl[firstProp] as Any
  let fp = firstType.allProperties.get(firstProp) as Any
  if (!fp) {
    throw new ServiceError("ValidationError", `Property '${firstProp}' on type '${firstType.name}' does not extist.`)
  }
  let sp = secondType.allProperties.get(secondProp) as Any
  if (!sp) {
    throw new ServiceError("ValidationError", `Property '${secondProp}' on type '${secondType.name}' does not extist.`)
  }
  let firstPropType = findTypeCategory(fp /*, firstType, firstProp*/) // fp.typeCategory
  let secondPropType = findTypeCategory(sp /*, secondType, secondProp*/) // sp.typeCategory
  if (firstPropType === undefined)
    throw new ServiceError(
      "ValidationError",
      `Property '${firstProp}' on type '${firstType.name}' is not a valid link.`
    )
  if (secondPropType === undefined)
    throw new ServiceError(
      "ValidationError",
      `Property '${secondProp}' on type '${secondType.name}' is not a valid link.`
    )
  fp = findBaseType(fp, firstType, firstProp)
  sp = findBaseType(sp, secondType, secondProp)
  if (fp !== secondType) {
    throw new ServiceError(
      "ValidationError",
      `Property '${firstProp}' on type '${firstType.name}' is not referencing '${secondType.name}' type.`
    )
    return
  }
  if (sp !== firstType) {
    throw new ServiceError(
      "ValidationError",
      `Property '${secondProp}' on type '${secondType.name}' is not referencing '${firstType.name}' type.`
    )
    return
  }
  for (let e of firstType.inverseCollection.values()) {
    if (e.propName === secondProp && e.type === secondType) {
      throw new ServiceError(
        "ValidationError",
        `Property '${secondProp}' of type '${secondType.name}' is already inverse in '${firstType.name}' type.`
      )
      return
    }
  }
  for (let e of secondType.inverseCollection.values()) {
    if (e.propName === firstProp && e.type === firstType) {
      throw new ServiceError(
        "ValidationError",
        `Property '${firstProp}' of type '${firstType.name}' is already inverse in '${secondType.name}' type.`
      )
      return
    }
  }
  firstType.inverseCollection.set(firstProp, {
    propName: secondProp,
    propType: secondPropType,
    type: secondType,
  })
  secondType.inverseCollection.set(secondProp, {
    propName: firstProp,
    propType: firstPropType,
    type: firstType,
  })
}
