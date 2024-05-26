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
import { capitalizeFirstLetter, getIDPropName, objectStatus} from "../common/CommonConstants"
import { StatusValue, setStatus } from "../common/Status"
import { ImmutableStore } from "./immutable-store"




// Define simple value property
export function defineSimpleValue(target: any, propName: string, targetType: Any, store:ImmutableStore<any>) {
  const privatePropName = `_${propName}`
  target[privatePropName] = undefined

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      return this[privatePropName]
    },
    set(value: any) {
      if (this.isDeleted) {
        throw new Error("Cannot modify properties on a deleted object.")
      }
      if (this[privatePropName] === value) return
      this[objectStatus] =  setStatus(this[objectStatus], StatusValue.Updated)
      const operation: Operation = {
        operationType: "set",
        target: this,
        propName: propName,
        oldValue: this[privatePropName],
        newValue: value,
        targetType: targetType,
        inversePropName: undefined,
      }

      store.getContext().pushOperation(operation)

      this[privatePropName] = value
    },
  })
}

export function defineComplexObjectProp(
  target: any,
  propName: string,
  isPropViaID: boolean,
  store:ImmutableStore<any>,
  targetType: AnyObjectType
) {
  const privatePropName = `_${propName}`
  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      // check for deleted objects
      const propValue = isPropViaID ? store.getContext().idMap.get(this[privatePropName]) : this[privatePropName]
      if (propValue && propValue.isDeleted) {
        return undefined
      }
      return propValue
    },
    set(value: any) {
      if (this.isDeleted) {
        throw new Error("Cannot modify properties on a deleted object.")
      }

      const thisPropIDName = getIDPropName(targetType)

      if (value && value.isDeleted) {
        throw new Error("Cannot set a property to a deleted object.")
      }
      const oldValue = this[privatePropName]
      this[privatePropName] = isPropViaID ? value[thisPropIDName] : value
      this[objectStatus] =  setStatus(this[objectStatus], StatusValue.Updated)
      store.getContext().pushOperation({
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

export function defineComplexArrayProp(
  target: any,
  propName: string,
  isPropViaID: boolean,
  store:ImmutableStore<any>,
  targetType: AnyObjectType
) {
  const privatePropName = `_${propName}`

  // Getter
  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }

      let resultArray: any[] = []  //TODO: create observable array

      if (isPropViaID) {
        resultArray = this[privatePropName].map((id: string) => {
          const obj = store.getContext().idMap.get(id)
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
    this[privatePropName].push(isPropViaID ? item[thisPropIDName] : item)
    //TODO: set array status modified
    store.getContext().pushOperation({
      operationType: "add",
      target: this,
      targetType,
      propName,
      value: item,
    })
  }

  target[`add${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function (item: any) {
    this[privatePropName].push(isPropViaID ? item[thisPropIDName] : item)
    store.getContext().pushOperation({
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

    const index = this[privatePropName].indexOf(isPropViaID ? item[thisPropIDName] : item)
    if (index === -1) return

    this[privatePropName].splice(index, 1)

    store.getContext().pushOperation({
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
  store:ImmutableStore<any>,
  isPropViaID: boolean = false,
  isInversePropViaID: boolean = false
) {
  const privatePropName = `_${propName}`

  Object.defineProperty(target, propName, {
    get() {
      if (this.isDeleted) {
        throw new Error("Cannot access properties on a deleted object.")
      }
      if (isPropViaID) {
        const id = this[privatePropName]
        if (id === undefined) {
          return undefined
        }
        const obj = store.getContext().idMap.get(id)
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
        return this[privatePropName]?.isDeleted ? undefined : this[privatePropName]
      }
    },

    set(value: any) {
      if (this.isDeleted || (value && value.isDeleted)) {
        throw new Error("Cannot modify properties on a deleted object.")
      }
      const thisPropIDName = getIDPropName(targetType)
      const inversePropIDName = getIDPropName(inverseType)

      const oldValue = this[propName]
      if (oldValue === value) return

      // set this object status
      this[objectStatus] =  setStatus(this[objectStatus], StatusValue.Updated)
      
      // Disconnect the old inverse target
      if (oldValue) {
        oldValue[`_${inversePropName}`] = undefined
        // set oldValue object status
        oldValue[objectStatus] =  setStatus(oldValue[objectStatus], StatusValue.Updated)
      }

      if (value) {
        // set oldValue object status
        value[objectStatus] =  setStatus(value[objectStatus], StatusValue.Updated)

        // Connect the new inverse target
        value[`_${inversePropName}`] = isInversePropViaID ? this[inversePropIDName] : this
        // Update the property
        this[privatePropName] = isPropViaID ? value[thisPropIDName] : value
      } else {
        this[privatePropName] = undefined
      }

      // Push the operation to the stack
      store.getContext().pushOperation({
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
  store:ImmutableStore<any>,
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
      if (isPropViaID) {
        return this[privatePropName]
          .map((id: string) => store.getContext().idMap.get(id))
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

    const thisPropIDName = getIDPropName(targetType)
    const inversePropIDName = getIDPropName(inverseType)

    const valueToAdd = isPropViaID ? item[inversePropIDName] : item
    this[privatePropName].push(valueToAdd)

    if (isInversePropViaID) {
      item[`_${inversePropName}`] = this[thisPropIDName]
    } else {
      item[`_${inversePropName}`] = this
    }

    store.getContext().pushOperation({
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

    const thisPropIDName = getIDPropName(targetType)
    const inversePropIDName = getIDPropName(inverseType)

    const index = this[privatePropName].indexOf(isPropViaID ? item[inversePropIDName] : item)
    if (index === -1) return

    // Update the operation stack
    store.getContext().pushOperation({
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
  store:ImmutableStore<any>,
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

      if (isPropViaID) {
        const value = this[privatePropName]
        if (value === undefined) return undefined

        const obj = store.getContext().idMap.get(value)
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
        if (isInversePropViaID && !value[`_${inversePropName}`].includes(this[thisPropIDName])) {
          value[`_${inversePropName}`].push(this[thisPropIDName])
        } else if (!isInversePropViaID && !value[`_${inversePropName}`].includes(this)) {
          value[`_${inversePropName}`].push(this)
        }
      } else {
        this[privatePropName] = undefined
      }

      // Push the operation to the stack
      store.getContext().pushOperation({
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
  store:ImmutableStore<any>,
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

      // If the property is supposed to hold IDs, simply return the array of IDs
      if (isPropViaID) {
        return this[privatePropName]
          .map((id: string) => store.getContext().idMap.get(id))
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
    store.getContext().pushOperation({
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
    store.getContext().pushOperation({
      operationType: "remove",
      target: this,
      targetType,
      propName,
      value: item,
    })
  }
}
