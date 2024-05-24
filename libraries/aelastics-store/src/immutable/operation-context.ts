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

import { Any, AnyObjectType, ObjectLiteral } from "aelastics-types"
import { capitalizeFirstLetter } from "../common/CommonConstants"
import { Class } from "./createClass"
import { getIDPropName } from "./propCreatorsWithUndo"

// export type Operation = {
//     operationType: "add" | "remove" | "set";
//     target: any;
//     propName: string;
//     inversePropName?: string;
//     oldValue: any;
//     newValue: any;
//     oldInverseValue?: any;
//     targetType: Any;
//     inverseType?: AnyObjectType;
// };
type BaseOperation = {
  operationType: string
  target: any
}

type SetOperation = BaseOperation & {
  operationType: "set"
  targetType: Any
  propName: string
  oldValue: any
  newValue: any
  inversePropName?: string
}

type AddOperation = BaseOperation & {
  operationType: "add"
  targetType: Any
  propName: string
  value: any
}

type RemoveOperation = BaseOperation & {
  operationType: "remove"
  targetType: Any
  propName: string
  value: any
}

type CreateOperation = BaseOperation & {
  operationType: "create"
  targetType: Any
  dynamicClass: any
  initialProps: any
}

type DeleteOperation = BaseOperation & {
  operationType: "delete"
}

export type Operation = SetOperation | AddOperation | RemoveOperation | CreateOperation | DeleteOperation

export class ObjectNotFoundError extends Error {
  constructor(public id: string, public targetType: Any, message: string) {
    super(message)
    this.name = "ObjectNotFoundError"
  }
}

export class OperationContext {
  operationStack: Operation[] = []
  redoStack: Operation[] = []
  isUndoRedoOperation: boolean = false
  idMap: Map<string, any> = new Map()
  deletedMap: Map<string, any> = new Map()

  startUndoRedoOperation() {
    this.isUndoRedoOperation = true
  }

  endUndoRedoOperation() {
    this.isUndoRedoOperation = false
  }

  // Pushes an operation onto the operationStack and handles the redoStack
  pushOperation(operation: Operation) {
    if (!this.isUndoRedoOperation) {
      this.operationStack.push(operation)
      this.redoStack.length = 0 // Clear the redo stack only if not in undo/redo operation
    }
  }

  createObject<P extends ObjectLiteral>(dynamicClass: Class<any>, initialProps: ObjectLiteral, targetType: AnyObjectType): P {
    // Create a new instance of the dynamic class
    const instance = new dynamicClass(initialProps)
    const IDName = getIDPropName(targetType)
    // Add the object to the idMap
    this.idMap.set(instance[IDName], instance)

    // Push the create operation onto the operation stack
    this.pushOperation({
      operationType: "create",
      target: instance,
      targetType: targetType, // Use the passed-in AnyObjectType
      initialProps: initialProps,
      dynamicClass: dynamicClass,
    })
    return instance as P
  }

  deleteObject<P extends ObjectLiteral>(obj: P) {
    this.pushOperation({
      operationType: "delete",
      target: obj,
    })
    // retrieve the object's ID and set the object's isDeleted  property FROM THE IDMAP  to true
    const ID = obj["@@aelastics/ID"]

    // this.idMap.set(ID, obj)

    const objToDel = this.idMap.get(ID)
    //objToDel.isDeleted = true

    this.deletedMap.set(ID, objToDel)
    this.idMap.delete(ID)
  }

  undo() {
    if (this.operationStack.length === 0) return
    // begin undo
    this.startUndoRedoOperation()
    const lastOperation = this.operationStack.pop()!
    this.redoStack.push(lastOperation)

    switch (lastOperation.operationType) {
      case "set":
        lastOperation.target[lastOperation.propName] = lastOperation.oldValue
        // Restore the oldInverseValue on the newValue object
        if (lastOperation.inversePropName && lastOperation.newValue) {
          lastOperation.newValue[`_${lastOperation.inversePropName}`] = lastOperation.oldValue
        }
        break
      case "add":
        if (lastOperation.target.isDeleted) {
          throw new Error("Cannot undo operation on a deleted object.")
        }
        const removeMethodName = `remove${capitalizeFirstLetter(lastOperation.propName)}`
        lastOperation.target[removeMethodName](lastOperation.value)
        break
      case "remove":
        if (lastOperation.target.isDeleted) {
          throw new Error("Cannot undo operation on a deleted object.")
        }
        const addMethodName = `add${capitalizeFirstLetter(lastOperation.propName)}`
        lastOperation.target[addMethodName](lastOperation.value)
        break
      case "create":
        this.idMap.delete(lastOperation.target.id)
        lastOperation.target.isDeleted = true
        break
      case "delete":
        this.idMap.set(lastOperation.target.id, lastOperation.target)
        lastOperation.target.isDeleted = false
        break
      default:
        throw new Error(`Unknown operation type: ${lastOperation["operationType"]}`)
    }
    // end undo
    this.endUndoRedoOperation()
  }

  redo() {
    if (this.redoStack.length === 0) return
    // begin redo
    this.startUndoRedoOperation()
    const lastOperation = this.redoStack.pop()!
    this.operationStack.push(lastOperation)

    switch (lastOperation.operationType) {
      case "set":
        if (lastOperation.target.isDeleted) {
          throw new Error("Cannot redo operation on a deleted object.")
        }
        lastOperation.target[lastOperation.propName] = lastOperation.newValue
        if (lastOperation.inversePropName && lastOperation.newValue) {
          lastOperation.newValue[lastOperation.inversePropName] = lastOperation.target
        }
        break

      case "add":
        if (lastOperation.target.isDeleted) {
          throw new Error("Cannot redo operation on a deleted object.")
        }
        const addMethodName = `add${capitalizeFirstLetter(lastOperation.propName)}`
        lastOperation.target[addMethodName](lastOperation.value)
        break

      case "remove":
        if (lastOperation.target.isDeleted) {
          throw new Error("Cannot redo operation on a deleted object.")
        }
        const removeMethodName = `remove${capitalizeFirstLetter(lastOperation.propName)}`
        lastOperation.target[removeMethodName](lastOperation.value)
        break

      case "create":
        if (lastOperation.target.isDeleted) {
          throw new Error("Cannot redo operation on a deleted object.")
        }
        this.idMap.set(lastOperation.target.id, lastOperation.target)
        lastOperation.target.isDeleted = false
        break

      case "delete":
        if (lastOperation.target.isDeleted) {
          throw new Error("Cannot redo operation on a deleted object.")
        }
        this.idMap.delete(lastOperation.target.id)
        lastOperation.target.isDeleted = true
        break

      default:
        throw new Error(`Unknown operation type: ${lastOperation["operationType"]}`)
    }
    // end redo
    this.endUndoRedoOperation()
  }
}
