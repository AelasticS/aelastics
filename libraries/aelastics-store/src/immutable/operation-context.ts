/*
 * Project: aelastics-store
 * Created Date: Friday September 15th 2023
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

import { Any, AnyObjectType } from "aelastics-types";

export type Operation = {
    operationType: "add" | "remove" | "set";
    target: any;
    propName: string;
    inversePropName?: string;
    oldValue: any;
    newValue: any;
    oldInverseValue?: any;
    targetType: Any;
    inverseType?: AnyObjectType;
};

export class ObjectNotFoundError extends Error {
    constructor(public id: string, public targetType: Any, message: string) {
        super(message);
        this.name = 'ObjectNotFoundError';
    }
}

export class OperationContext {
    operationStack: Operation[] = [];
    redoStack: Operation[] = [];
    isUndoRedoOperation: boolean = false;
    idMap: Map<string, any> = new Map()

    startUndoRedoOperation() {
        this.isUndoRedoOperation = true;
    }

    endUndoRedoOperation() {
        this.isUndoRedoOperation = false;
    }

    // Pushes an operation onto the operationStack and handles the redoStack
    pushOperation(operation: Operation) {
        if (!this.isUndoRedoOperation) {
            this.operationStack.push(operation);
            this.redoStack.length = 0; // Clear the redo stack only if not in undo/redo operation
        }
    }

 
    undo() {
        const { operationStack, redoStack } = this;
        if (operationStack.length === 0) return;

        this.startUndoRedoOperation();

        const lastOperation = operationStack.pop()!;
        redoStack.push(lastOperation);

        // Capture the current length of the operationStack
        // const initialStackLength = operationStack.length;

        // Perform the undo operation based on the operation type
        if (lastOperation.operationType === "add") {
            lastOperation.target[
                `remove${lastOperation.propName.charAt(0).toUpperCase() +
                lastOperation.propName.slice(1)
                }`
            ](lastOperation.newValue);
        } else if (lastOperation.operationType === "remove") {
            lastOperation.target[
                `add${lastOperation.propName.charAt(0).toUpperCase() +
                lastOperation.propName.slice(1)
                }`
            ](lastOperation.oldValue);
        } else {
            lastOperation.target[lastOperation.propName] = lastOperation.oldValue;
            // Restore the oldInverseValue on the newValue object
            if (lastOperation.inversePropName && lastOperation.newValue) {
                lastOperation.newValue[`_${lastOperation.inversePropName}`] =
                    lastOperation.oldInverseValue;
            }
        }

        // Remove any additional operations that were pushed onto the stack due to synchronization
        // while (operationStack.length > initialStackLength) {
        //     operationStack.pop();
        // }

        this.endUndoRedoOperation();
    }

    redo() {
        const { operationStack, redoStack } = this;
        if (redoStack.length === 0) return;

        this.startUndoRedoOperation();

        const lastOperation = redoStack.pop()!;
        operationStack.push(lastOperation);

        // Capture the current length of the operationStack
        // const initialStackLength = operationStack.length;

        if (lastOperation.operationType === "add") {
            lastOperation.target[
                `add${lastOperation.propName.charAt(0).toUpperCase() +
                lastOperation.propName.slice(1)
                }`
            ](lastOperation.newValue);
        } else if (lastOperation.operationType === "remove") {
            lastOperation.target[
                `remove${lastOperation.propName.charAt(0).toUpperCase() +
                lastOperation.propName.slice(1)
                }`
            ](lastOperation.oldValue);
        } else {
            lastOperation.target[lastOperation.propName] = lastOperation.newValue;
        }

        // Remove any additional operations that were pushed onto the stack due to synchronization
        // while (operationStack.length > initialStackLength) {
        //     operationStack.pop();
        // }
        this.endUndoRedoOperation();
    }
}