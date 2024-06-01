/*
 * Project: aelastics-store
 * Created Date: Wednesday September 13th 2023
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Sunday, 17th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

import { Any, AnyObjectType } from "aelastics-types"
import { OperationContext, ObjectNotFoundError, Operation } from "./operation-context"
import {
  capitalizeFirstLetter,
  clone,
  context,
  getIDPropName,
  objectStatus,
  shallowCloneObject,
} from "../common/CommonConstants"
import { StatusValue, setStatus } from "../common/Status"

// Define simple value property
export function defineSimpleValue(target: any, propName: string, targetType: Any) {
  const privatePropName = `_${propName}`
  target[privatePropName] = undefined

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")
      if (ctx.operationMode === "immutable" && this[clone]) {
        return this[clone][privatePropName]
      } else return this[privatePropName]
    },
    set(value: any) {
      if (this.isDeleted) {
        throw new Error("Cannot modify properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")
      if (ctx.operationMode === "frozen") {
        throw new Error("Cannot modify properties on an object in frozen mode of the store.")
      }
      if (this[privatePropName] === value) return
      this[objectStatus] = setStatus(this[objectStatus], StatusValue.Updated)
      if (ctx.operationMode === "immutable") {
        if (!this[clone]) {
          this[clone] = shallowCloneObject(this)
        }
        this[clone][privatePropName] = value
      } else this[privatePropName] = value

      // make operation log
      const operation: Operation = {
        operationType: "set",
        target: this,
        propName: propName,
        oldValue: this[privatePropName],
        newValue: value,
        targetType: targetType,
        inversePropName: undefined,
      }
      ctx.pushOperation(operation)
    },
  })
}

export function defineComplexObjectProp(
  target: any,
  propName: string,
  isPropViaID: boolean,
  targetType: AnyObjectType
) {
  const privatePropName = `_${propName}`

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")
      // check for deleted objects
      const propValue = isPropViaID ? ctx.idMap.get(this[privatePropName]) : this[privatePropName]
      if (propValue && propValue.isDeleted) {
        return undefined
      }
      return propValue
    },
    set(value: any) {
      if (this.isDeleted) {
        throw new Error("Cannot modify properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")
      const thisPropIDName = getIDPropName(targetType)

      if (value && value.isDeleted) {
        throw new Error("Cannot set a property to a deleted object.")
      }
      const oldValue = this[privatePropName]
      this[privatePropName] = isPropViaID ? value[thisPropIDName] : value
      this[objectStatus] = setStatus(this[objectStatus], StatusValue.Updated)
      ctx.pushOperation({
        operationType: "set",
        target: this,
        propName: propName,
        oldValue: oldValue,
        newValue: value,
        targetType,
      })
    },
  })
}

export function defineComplexArrayProp(target: any, propName: string, isPropViaID: boolean, targetType: AnyObjectType) {
  const privatePropName = `_${propName}`

  // Getter
  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")

      let resultArray: any[] = [] //TODO: create observable array

      if (isPropViaID) {
        resultArray = this[privatePropName].map((id: string) => {
          const obj = ctx.idMap.get(id)
          if (!obj) {
            throw new Error(`Object with ID "${id}" of type "${targetType.name}" not found.`)
          }
          return obj.isDeleted ? undefined : obj
        })
      } else {
        resultArray = this[privatePropName].filter((obj: any) => !obj.isDeleted)
      }

      return resultArray.filter((obj: any) => obj !== undefined)
    },
  })

  const thisPropIDName = getIDPropName(targetType)

  // Add method
  target[`add${capitalizeFirstLetter(propName)}`] = function (item: any) {
    if (this.isDeleted || item.isDeleted) {
      throw new Error("Cannot modify properties on a deleted object.")
    }
    const ctx: OperationContext<any> = this[context]
    if (!ctx) throw new Error("Object has no operation context!")

    this[privatePropName].push(isPropViaID ? item[thisPropIDName] : item)
    //TODO: set array status modified
    ctx.pushOperation({
      operationType: "add",
      target: this,
      targetType,
      propName,
      value: item,
    })
  }

  target[`add${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function (item: any) {
    const ctx: OperationContext<any> = this[context]
    if (!ctx) throw new Error("Object has no operation context!")

    this[privatePropName].push(isPropViaID ? item[thisPropIDName] : item)
    ctx.pushOperation({
      operationType: "add",
      target: this,
      propName: propName,
      value: item,
      targetType: targetType,
    })
  }
  // Remove method
  target[`remove${capitalizeFirstLetter(propName)}`] = function (item: any) {
    if (this.isDeleted || item.isDeleted) {
      throw new Error("Cannot modify properties on a deleted object.")
    }
    const ctx: OperationContext<any> = this[context]
    if (!ctx) throw new Error("Object has no operation context!")
    const index = this[privatePropName].indexOf(isPropViaID ? item[thisPropIDName] : item)
    if (index === -1) return

    this[privatePropName].splice(index, 1)

    ctx.pushOperation({
      operationType: "remove",
      target: this,
      targetType: targetType,
      propName: propName,
      value: item,
    })
  }
}

export function defineOneToOne(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  isPropViaID: boolean = false,
  isInversePropViaID: boolean = false
) {
  const privatePropName = `_${propName}`

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")

      const thisObject = ctx.operationMode === "immutable" && this[clone] ? this[clone] : this

      if (isPropViaID) {
        const id = thisObject[privatePropName]
        if (id === undefined) {
          return undefined
        }

        const obj = ctx.idMap.get(id)
        if (!obj) {
          // TODO: lazy evaluation
          throw new ObjectNotFoundError(
            id,
            targetType,
            `Object with ID "${id}" not found in idMap for target type "${targetType.name}".`
          )
        }
        return obj.isDeleted ? undefined : obj
      } else {
        return thisObject[privatePropName]?.isDeleted ? undefined : thisObject[privatePropName]
      }
    },

    set(value: any) {
      if (this.isDeleted || (value && value.isDeleted)) {
        throw new Error("Cannot modify properties on a deleted object.")
      }

      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")

      if (ctx.operationMode === "frozen") {
        throw new Error("Cannot modify properties on an object in frozen mode of the store.")
      }

      const thisPropIDName = getIDPropName(targetType)
      const inversePropIDName = getIDPropName(inverseType)

      // set this object status
      this[objectStatus] = setStatus(this[objectStatus], StatusValue.Updated)

      //if this[objectStatus] = StatusValue.Initializing or StatusValue.Created then set thisObject to this

      const thisObject =
        ctx.operationMode === "immutable" ? this[clone] || (this[clone] = shallowCloneObject(this)) : this

      const oldValue = thisObject[propName]
      if (oldValue === value) return

      // if (ctx.operationMode === "immutable") {
      //   if (!this[clone]) {
      //     this[clone] = shallowCloneObject(this)
      //   }
      // }

      // Disconnect the old inverse target
      if (oldValue) {
        const oldValueObject =
          ctx.operationMode === "immutable"
            ? oldValue[clone] || (oldValue[clone] = shallowCloneObject(oldValue))
            : oldValue

        oldValueObject[`_${inversePropName}`] = undefined
        // set oldValue object status
        oldValue[objectStatus] = setStatus(oldValue[objectStatus], StatusValue.Updated)
      }

      if (value) {
        const newValueObject =
          ctx.operationMode === "immutable" ? value[clone] || (value[clone] = shallowCloneObject(value)) : value

        // set value object status
        value[objectStatus] = setStatus(value[objectStatus], StatusValue.Updated)

        // Connect the new inverse target
        newValueObject[`_${inversePropName}`] = isInversePropViaID ? thisObject[inversePropIDName] : thisObject
        // Update the property
        thisObject[privatePropName] = isPropViaID ? newValueObject[thisPropIDName] : newValueObject
      } else {
        thisObject[privatePropName] = undefined
      }

      // Push the operation to the stack
      ctx.pushOperation({
        operationType: "set",
        target: this,
        targetType,
        inversePropName,
        propName,
        oldValue,
        newValue: value,
      })
    },
    enumerable: true,
  })
}

export function defineOneToMany(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  isPropViaID: boolean = false,
  isInversePropViaID: boolean = false
) {
  const privatePropName = `_${propName}`
  target[privatePropName] = []

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")

      if (isPropViaID) {
        return this[privatePropName]
          .map((id: string) => ctx.idMap.get(id))
          .filter((item: any) => item && !item.isDeleted)
      } else {
        return this[privatePropName].filter((item: any) => !item.isDeleted)
      }
    },
  })

  // Add method
  target[`add${capitalizeFirstLetter(propName)}`] = function (item: any) {
    if (this.isDeleted || item.isDeleted) {
      throw new Error("Cannot modify properties on a deleted object.")
    }
    const ctx: OperationContext<any> = this[context]
    if (!ctx) throw new Error("Object has no operation context!")

    const thisPropIDName = getIDPropName(targetType)
    const inversePropIDName = getIDPropName(inverseType)

    const valueToAdd = isPropViaID ? item[inversePropIDName] : item
    this[privatePropName].push(valueToAdd)

    if (isInversePropViaID) {
      item[`_${inversePropName}`] = this[thisPropIDName]
    } else {
      item[`_${inversePropName}`] = this
    }

    ctx.pushOperation({
      operationType: "add",
      target: this,
      targetType,
      propName,
      value: item,
    })
  }

  target[`remove${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function (item: any) {
    if (this.isDeleted || item.isDeleted) {
      throw new Error("Cannot modify properties on a deleted object.")
    }
    const ctx: OperationContext<any> = this[context]
    if (!ctx) throw new Error("Object has no operation context!")

    const thisPropIDName = getIDPropName(targetType)
    const inversePropIDName = getIDPropName(inverseType)

    const index = this[privatePropName].indexOf(isPropViaID ? item[inversePropIDName] : item)
    if (index === -1) return

    // Update the operation stack
    ctx.pushOperation({
      operationType: "remove",
      target: this,
      targetType,
      propName,
      value: item,
    })

    this[privatePropName].splice(index, 1)
    item[`_${inversePropName}`] = undefined
  }
}

export function defineManyToOne(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  isPropViaID: boolean = false,
  isInversePropViaID: boolean = false
) {
  const privatePropName = `_${propName}`

  const thisPropIDName = getIDPropName(targetType)
  const inversePropIDName = getIDPropName(inverseType)

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")

      if (isPropViaID) {
        const value = this[privatePropName]
        if (value === undefined) return undefined

        const obj = ctx.idMap.get(value)
        if (!obj) {
          throw new ObjectNotFoundError(
            value,
            targetType,
            `Object with ID "${value}" not found in idMap for target type "${targetType.name}".`
          )
        }

        return obj.isDeleted ? undefined : obj
      } else {
        return this[privatePropName]?.isDeleted ? undefined : this[privatePropName]
      }
    },

    set(value: any) {
      if (this.isDeleted) {
        throw new Error("Cannot modify properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")

      // Find the old value
      const oldValue = this[propName]

      if (oldValue === value) return

      // Disconnect the old parent
      if (oldValue) {
        const index = oldValue[`_${inversePropName}`].indexOf(isInversePropViaID ? this[thisPropIDName] : this)
        if (index !== -1) {
          oldValue[`_${inversePropName}`].splice(index, 1)
        }
      }

      if (value) {
        // Update the property
        this[privatePropName] = isPropViaID ? value[inversePropIDName] : value

        // Connect the new parent
        if (isInversePropViaID && !value[`_${inversePropName}`]?.includes(this[thisPropIDName])) {
          value[`_${inversePropName}`]?.push(this[thisPropIDName])
        } else if (!isInversePropViaID && !value[`_${inversePropName}`]?.includes(this)) {
          value[`_${inversePropName}`]?.push(this)
        }
      } else {
        this[privatePropName] = undefined
      }

      // Push the operation to the stack
      ctx.pushOperation({
        operationType: "set",
        target: this,
        targetType,
        inversePropName,
        propName,
        oldValue,
        newValue: value,
      })
    },
  })
}

export function defineManyToMany(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  isPropViaID: boolean = false,
  isInversePropViaID: boolean = false
) {
  const privatePropName = `_${propName}`
  const privateInversePropName = `_${inversePropName}`

  const thisPropIDName = getIDPropName(targetType)
  const inversePropIDName = getIDPropName(inverseType)

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      const ctx: OperationContext<any> = this[context]
      if (!ctx) throw new Error("Object has no operation context!")

      // If the property is supposed to hold IDs, simply return the array of IDs
      if (isPropViaID) {
        return this[privatePropName]
          .map((id: string) => ctx.idMap.get(id))
          .filter((item: any) => item && !item.isDeleted)
      }

      // If the property is supposed to hold object references, filter out deleted objects
      return this[privatePropName].filter((obj: any) => !obj.isDeleted)
    },
  })

  // Add method
  target[`add${capitalizeFirstLetter(propName)}`] = function (item: any) {
    if (this.isDeleted || item.isDeleted) {
      throw new Error("Cannot modify properties on a deleted object.")
    }
    const ctx: OperationContext<any> = this[context]
    if (!ctx) throw new Error("Object has no operation context!")

    // Find the value to add based on isPropViaID
    const valueToAdd = isPropViaID ? item[inversePropIDName] : item

    // Check if the item is already in the array
    if (this[privatePropName].includes(valueToAdd)) {
      return
    }

    // Add the item to the array
    this[privatePropName].push(valueToAdd)

    // Add the inverse item
    if (isInversePropViaID) {
      item[privateInversePropName].push(this[thisPropIDName])
    } else {
      item[privateInversePropName].push(this)
    }

    // Push the operation to the operation stack
    ctx.pushOperation({
      operationType: "add",
      target: this,
      targetType,
      propName,
      value: item,
    })
  }

  // Remove method
  target[`remove${capitalizeFirstLetter(propName)}`] = function (item: any) {
    if (this.isDeleted || item.isDeleted) {
      throw new Error("Cannot modify properties on a deleted object.")
    }

    const ctx: OperationContext<any> = this[context]
    if (!ctx) throw new Error("Object has no operation context!")

    // Find the value to remove based on isPropViaID
    const valueToRemove = isPropViaID ? item[inversePropIDName] : item

    // Find the index of the item in the array
    const index = this[privatePropName].indexOf(valueToRemove)

    // If the item is not in the array, return
    if (index === -1) {
      return
    }

    // Remove the item from the array
    this[privatePropName].splice(index, 1)

    // Remove the inverse item
    const inverseIndex = isInversePropViaID
      ? item[privateInversePropName].indexOf(this[inversePropIDName])
      : item[privateInversePropName].indexOf(this)

    if (inverseIndex !== -1) {
      item[privateInversePropName].splice(inverseIndex, 1)
    }

    // Push the operation to the operation stack
    ctx.pushOperation({
      operationType: "remove",
      target: this,
      targetType,
      propName,
      value: item,
    })
  }
}
