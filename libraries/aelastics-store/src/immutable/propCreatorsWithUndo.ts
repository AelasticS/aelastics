import { AnyObjectType } from "aelastics-types";

type Operation = {
  operationType: "add" | "remove" | "set";
  target: any;
  propName: string;
  inversePropName?: string;
  oldValue: any;
  newValue: any;
  oldInverseValue?: any;
  targetType: AnyObjectType;
  inverseType?: AnyObjectType;
};

export class ObjectNotFoundError extends Error {
  constructor(public id: string, public targetType: AnyObjectType, message: string) {
    super(message);
    this.name = 'ObjectNotFoundError';
  }
}

export class OperationContext {
  operationStack: Operation[] = [];
  redoStack: Operation[] = [];
  idMap: Map<string, any> = new Map()
};

// const operationStack: Operation[] = [];
// const redoStack: Operation[] = [];

export function undo(context: OperationContext) {
  const { operationStack, redoStack } = context;
  if (operationStack.length === 0) return;

  const lastOperation = operationStack.pop()!;
  redoStack.push(lastOperation);

  // Capture the current length of the operationStack
  const initialStackLength = operationStack.length;

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
  while (operationStack.length > initialStackLength) {
    operationStack.pop();
  }
}

export function redo(context: OperationContext) {
  const { operationStack, redoStack } = context;
  if (redoStack.length === 0) return;

  const lastOperation = redoStack.pop()!;
  operationStack.push(lastOperation);

  // Capture the current length of the operationStack
  const initialStackLength = operationStack.length;

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
  while (operationStack.length > initialStackLength) {
    operationStack.pop();
  }
}

// Define simple value property
export function defineSimpleValue(
  target: any,
  propName: string,
  targetType: AnyObjectType,
  context: OperationContext
) {
  const { operationStack, redoStack } = context;
  const privatePropName = `_${propName}`;
  target[privatePropName] = undefined;

  Object.defineProperty(target, propName, {
    get() {
      return this[privatePropName];
    },
    set(value: any) {
      if (this[privatePropName] === value) return;

      const operation: Operation = {
        operationType: "set",
        target: this,
        propName: propName,
        oldValue: this[privatePropName],
        newValue: value,
        targetType: targetType
      };

      operationStack.push(operation);
      // redoStack.length = 0;

      this[privatePropName] = value;
    },
  });
}


export function defineOneToOne(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  context: OperationContext,
  isPropID: boolean = false,
  isInversePropID: boolean = false
) {
  const { operationStack, redoStack } = context;
  const privatePropName = `_${propName}`;

  Object.defineProperty(target, propName, {
    get() {
      if (isPropID) {
        const id = this[privatePropName];
        if (!id) return undefined
        const obj = context.idMap.get(id);
        if (!obj) {
          throw new ObjectNotFoundError(id, targetType, `Object with ID ${id} not found in idMap for target type ${targetType}.`);
        }
        return obj;
      } else {
        return this[privatePropName];
      }
    },
    set(newValue: any) {
      const oldValue = this[propName]; // Always an object reference due to the getter
      if (oldValue === newValue) return;

      // Update the operation stack
      const operation: Operation = {
        operationType: 'set',
        target: this,
        propName: propName,
        oldValue: oldValue,
        newValue: newValue,
        inversePropName: inversePropName,
        targetType: targetType,
        inverseType: inverseType,
      };
      context.operationStack.push(operation);

      // Disconnect the old value if it exists
      if (oldValue) {
        oldValue[`_${inversePropName}`] = undefined;
      }

      // Connect the new value if it exists
      if (newValue) {
        newValue[`_${inversePropName}`] = isInversePropID ? this.id : this;
      }

      // Update the property
      this[privatePropName] = isPropID ? newValue.id : newValue;
    },
  });
}

// Helper function to initialize the private property
function initializePrivateArrayProperty(obj: any, privatePropName: string) {
  if (!obj.hasOwnProperty(privatePropName)) {
    obj[privatePropName] = [];
  }
}

export function defineOneToMany(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  context: OperationContext,
  isPropID: boolean = false,
  isInversePropID: boolean = false
) {
  const { operationStack, redoStack } = context;
  const privatePropName = `_${propName}`;
  target[privatePropName] = [];

  Object.defineProperty(target, propName, {
    get() {
      // initializePrivateArrayProperty(this, privatePropName);
      return this[privatePropName];
    },
  });

  target[`add${propName.charAt(0).toUpperCase() + propName.slice(1)}`] =
    function (item: any) {
      // initializePrivateArrayProperty(this, privatePropName);
      const id = isPropID ? item.id : item;
      if (this[privatePropName].includes(id)) return;

      this[privatePropName].push(id);

      // Update the operation stack
      const operation: Operation = {
        operationType: 'add',
        target: this,
        propName: propName,
        oldValue: null,
        newValue: item,
        inversePropName: inversePropName,
        targetType: targetType,
        inverseType: inverseType,
      };
      context.operationStack.push(operation);

      // Add this object to the new item's property
      if (isInversePropID) {
        item[`_${inversePropName}`] = this.id;
      } else {
        item[`_${inversePropName}`] = this;
      }

    };

  target[`remove${propName.charAt(0).toUpperCase() + propName.slice(1)}`] =
    function (item: any) {
      // initializePrivateArrayProperty(this, privatePropName);
      const id = isPropID ? item.id : item;
      const index = this[privatePropName].indexOf(id);
      if (index === -1) return; // already connected

      // Update the operation stack
      const operation: Operation = {
        operationType: 'remove',
        target: this,
        propName: propName,
        oldValue: item,
        newValue: null,
        inversePropName: inversePropName,
        targetType: targetType,
        inverseType: inverseType,
      };
      context.operationStack.push(operation);

      this[privatePropName].splice(index, 1);
      item[`_${inversePropName}`] = undefined;

    };
}

export function defineManyToOne(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  context: OperationContext,
  isPropID: boolean = false,
  isInversePropID: boolean = false
) {
  const { operationStack, redoStack } = context;
  const privatePropName = `_${propName}`;

  Object.defineProperty(target, propName, {
    get() {
      if (isPropID) {
        if (!this[privatePropName]) return undefined
        const obj = context.idMap.get(this[privatePropName]);
        if (!obj) {
          throw new ObjectNotFoundError(this[privatePropName], targetType, `Object with ID ${this[privatePropName]} not found in idMap for target type ${targetType}.`);
        }
        return obj;
      } else {
        return this[privatePropName];
      }
    },
    set(value: any) {
      const newValue = isPropID ? value.id : value;
      const oldValue = this[privatePropName];
      if (newValue === oldValue) return;

      // Update the operation stack
      const operation: Operation = {
        operationType: 'set',
        target: this,
        propName: propName,
        oldValue: oldValue,
        newValue: newValue,
        targetType: targetType,
        inverseType: inverseType,
      };
      context.operationStack.push(operation);

      // Disconnect the old parent
      if (oldValue) {
        const oldParent = isInversePropID ? context.idMap.get(oldValue) : oldValue;
        if (oldParent) {
          const index = oldParent[`_${inversePropName}`].indexOf(isInversePropID ? this.id : this);
          if (index !== -1) {
            oldParent[`_${inversePropName}`].splice(index, 1);
          }
        }
      }

      // Connect the new parent
      this[privatePropName] = newValue;
      if (newValue) {
        const newParent = isInversePropID ? context.idMap.get(newValue) : newValue;
        if (!newParent) {
          throw new ObjectNotFoundError(newValue, inverseType, `Object with ID ${newValue} not found in idMap for inverse type ${inverseType}.`);
        }
        newParent[`_${inversePropName}`].push(isInversePropID ? this.id : this);
      }

    },
  });
}

export function defineManyToMany(
  target: any,
  propName: string,
  inversePropName: string,
  targetType: AnyObjectType,
  inverseType: AnyObjectType,
  context: OperationContext,
  isPropID: boolean = false,
  isInversePropID: boolean = false
) {
  const { operationStack, redoStack } = context;
  const privatePropName = `_${propName}`;


  Object.defineProperty(target, propName, {
    get() {
      // initializePrivateArrayProperty(this, privatePropName);
      return this[privatePropName];
    },
  });

  target[`add${propName.charAt(0).toUpperCase() + propName.slice(1)}`] =
    function (item: any) {
      // initializePrivateArrayProperty(this, privatePropName);
      const itemId = isPropID ? item.id : item;
      if (this[privatePropName].includes(itemId)) return;

      // Update the operation stack
      const operation: Operation = {
        operationType: 'add',
        target: this,
        propName: propName,
        inversePropName: inversePropName,
        newValue: itemId,
        targetType: targetType,
        inverseType: inverseType,
        oldValue: undefined,
        oldInverseValue: undefined,
      };
      context.operationStack.push(operation);

      // Add the item to the new parent's array
      this[privatePropName].push(itemId);

      // Add this object to the new item's array
      if (!item[`_${inversePropName}`].includes(this)) {
        item[`_${inversePropName}`].push(isInversePropID ? this.id : this);
      }
    };

  target[`remove${propName.charAt(0).toUpperCase() + propName.slice(1)}`] =
    function (item: any) {
     // initializePrivateArrayProperty(this, privatePropName);
      const itemId = isPropID ? item.id : item;
      const index = this[privatePropName].indexOf(itemId);
      if (index === -1) return;

      // Update the operation stack
      const operation: Operation = {
        operationType: 'remove',
        target: this,
        propName: propName,
        inversePropName: inversePropName,
        oldValue: itemId,
        targetType: targetType,
        inverseType: inverseType,
        newValue: undefined,
      };
      context.operationStack.push(operation);

      // Remove the item from the current parent's array
      this[privatePropName].splice(index, 1);

      // Remove this object from the item's array
      const inverseIndex = item[`_${inversePropName}`].indexOf(isInversePropID ? this.id : this);
      if (inverseIndex !== -1) {
        item[`_${inversePropName}`].splice(inverseIndex, 1);
      }
    };
}


/* code for getting array of objects from array of IDs
get() {
      if (isPropID) {
        return this[privatePropName].map((id: string) => {
          const obj = context.idMap.get(id);
          if (!obj) {
            throw new ObjectNotFoundError(id, targetType, `Object with ID ${id} not found in idMap for target type ${targetType}.`);
          }
          return obj;
        });
      } else {
        return this[privatePropName];
      }
    },
  });
*/