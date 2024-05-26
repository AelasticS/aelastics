/*
 * Project: aelastics-store
 * Created Date: Friday September 15th 2023
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Sunday, 17th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

import { AnyObjectType, ObjectType, boolean } from "aelastics-types"

import {
  ImmutableObject,
  capitalizeFirstLetter,
  getUnderlyingType,
  objectStatus,
  objectUUID,
  objectType as OT,
  isTypeEntity,
} from "../common/CommonConstants"
import {
  defineSimpleValue,
  defineComplexObjectProp,
  defineComplexArrayProp,
  defineManyToMany,
  defineManyToOne,
  defineOneToMany,
  defineOneToOne,
} from "./propCreatorsWithUndo"
import { OperationContext } from "./operation-context"
import { uuidv4Generator } from "./repository"
import { StatusValue } from "../common/Status"
import { ImmutableStore } from "./immutable-store"

export type Class<P extends ImmutableObject> = { new (init: P, ID?:string): P }

/**
 * Dynamically creates a class based on a given object type.
 * Initializes the class with properties and defines getter and setter methods for each property.
 * Handles the creation of inverse relationships between objects.
 *
 * @param objectType - The object type for which the class is being created.
 * @param ctx - The operation context used for tracking changes.
 * @returns The dynamically created class based on the given object type.
 */
export function createClass<P extends ImmutableObject>(objectType: AnyObjectType, store:ImmutableStore<unknown>): Class<P> {
  const props = objectType.allProperties
  const inverses = objectType.allInverse
  class DynamicClass {
    [key: string]: any

    public get isDeleted(): boolean {
      return this[objectStatus] === StatusValue.Deleted
    }

    public get isUpdated(): boolean {
      return this[objectStatus] === StatusValue.Updated
    }

    constructor(init: P, ID?:string) {
      this[OT] = objectType.fullPathName
      this[isTypeEntity] = objectType.isEntity

      if (ID) { // allready existing objects
        this[objectUUID] = ID
        this[objectStatus] = StatusValue.Initializing
      } else {
        this[objectUUID] = uuidv4Generator()
        this[objectStatus] = StatusValue.Created
      }
      // Initialize private properties
      props.forEach((type, propName) => {
        // if init[propName] is an optional or link, we get the underlying type. here we need to figure out to be able to provide undefined if the value is not there

        // if init[propName] is a simple value or an object, we assign the setter method for it
        // if init[propName] is an array and holds either objects or simple values, then for each object in the array, we call the method declared in the prototype for it
        // if init[propName] is an array and is empty, we assign an empty array to it only if the property is not optional
        // if init[propName] is undefined, then we should store undefined only if the property is optional

        const privatePropName = `_${propName}`

        // in case we have optional type we get the underlying type
        const underlyingType = getUnderlyingType(type)

        if (underlyingType.typeCategory === "Array") {
          this[privatePropName] = createArray()
          if (init[propName] && init[propName].length > 0) {
            // for each element in the array of init[propName], we call the method this[`add${capitalizeFirstLetter(propName)}`](init[propName]) declared in the prototype for it
            init[propName].forEach((element: any) => {
              this[`add${capitalizeFirstLetter(propName)}`](element)
            })
          }
        } else if (init[propName]) {
          this[propName] = init[propName]
        } else if (type.typeCategory === "Optional") {
          this[privatePropName] = undefined
        } else {
          throw new Error(`Property "${propName}" is required!`)
        }
      })
      if (ID) { // allready existing objects
        this[objectStatus] = StatusValue.Unmodified
      }
    }
  }

  // Define properties
  props.forEach((propType, propName) => {
    if (inverses.has(propName)) {
      // get inverse info
      const inverseDescriptor = inverses.get(propName)!
      // set local variables
      const propObjectType = objectType // COMMENT: This is the type of the object that the property belongs to
      const realPropType = getUnderlyingType(propType) // COMMENT: In the case when the propType is a link, this will return the actual type of the link
      const { propName: inversePropName, propType: inversePropType, type: inverseObjectType } = inverseDescriptor
      const isPropID = propObjectType.isEntity
      const isInversePropID = inverseObjectType.isEntity

      // Define the property using the appropriate function based on its type and inverse
      if (realPropType.typeCategory === "Object" && inversePropType === "Object") {
        defineOneToOne(
          DynamicClass.prototype,
          propName,
          inversePropName,
          propObjectType,
          inverseObjectType,
          store,
          isPropID,
          isInversePropID
        )
      } else if (realPropType.typeCategory === "Object" && inversePropType === "Array") {
        defineManyToOne(
          DynamicClass.prototype,
          propName,
          inversePropName,
          propObjectType,
          inverseObjectType,
          store,
          isPropID,
          isInversePropID
        )
      } else if (realPropType.typeCategory === "Array" && inversePropType === "Object") {
        defineOneToMany(
          DynamicClass.prototype,
          propName,
          inversePropName,
          propObjectType,
          inverseObjectType,
          store,
          isPropID,
          isInversePropID
        )
      } else if (realPropType.typeCategory === "Array" && inversePropType === "Array") {
        defineManyToMany(
          DynamicClass.prototype,
          propName,
          inversePropName,
          propObjectType,
          inverseObjectType,
          store,
          isPropID,
          isInversePropID
        )
      }
    } else {
      // Define the property without an inverse
      const realPropType = getUnderlyingType(propType)
      if (realPropType.isSimple()) {
        defineSimpleValue(DynamicClass.prototype, propName, realPropType, store)
      } else if (realPropType.typeCategory === "Object") {
        const invType = realPropType as AnyObjectType

        defineComplexObjectProp(DynamicClass.prototype, propName, invType.isEntity, store, invType)
      } else if (realPropType.typeCategory === "Array") {
        const invType = realPropType as AnyObjectType
        defineComplexArrayProp(DynamicClass.prototype, propName, invType.isEntity, store, invType)
      }
    }
  })

  // define id property if it is an entity
  // if (type.isEntity) {
  //   if (type.identifier.length > 1) {
  //     throw new Error(`Entity type "${type.name}" error - No composite identifier allowed!`)
  //   }
  //   const idPropName = type.identifier[0]
  //   const privatePropName = `_${idPropName}`

  //   Object.defineProperty(DynamicClass.prototype, objectUUID, {
  //     get() {
  //       return this[privatePropName]
  //     },
  //     configurable: true,
  //   })
  // }

  // Object.defineProperty(DynamicClass.prototype, "isDeleted", {
  //   get() {
  //     return this["_isDeleted"]
  //   },
  //   set(value: boolean) {
  //     this["_isDeleted"] = value
  //   },
  //   configurable: true,
  // })

  // Return the dynamically created class with its own name
  Object.defineProperty(DynamicClass, "name", { value: objectType.name })
  return DynamicClass as unknown as Class<P>
}

//TODO: create an observarable array
function createArray(): any {
  return []
}
