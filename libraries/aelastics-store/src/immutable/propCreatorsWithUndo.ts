type Operation = {
  operationType: 'add' | 'remove' | 'set',
  target: any,
  propName: string,
  inversePropName: string,
  oldValue: any,
  newValue: any,
  oldInverseValue: any
};


const operationStack: Operation[] = [];
const redoStack: Operation[] = [];

export function undo() {
  if (operationStack.length === 0) return;

  const lastOperation = operationStack.pop()!;
  redoStack.push(lastOperation);

  // Capture the current length of the operationStack
  const initialStackLength = operationStack.length;

  // Perform the undo operation based on the operation type
  if (lastOperation.operationType === 'add') {
    lastOperation.target[`remove${lastOperation.propName.charAt(0).toUpperCase() + lastOperation.propName.slice(1)}`](lastOperation.newValue);
  } else if (lastOperation.operationType === 'remove') {
    lastOperation.target[`add${lastOperation.propName.charAt(0).toUpperCase() + lastOperation.propName.slice(1)}`](lastOperation.oldValue);
  } else {
    lastOperation.target[lastOperation.propName] = lastOperation.oldValue;
    // Restore the oldInverseValue on the newValue object
    if (lastOperation.newValue) {
      lastOperation.newValue[`_${lastOperation.inversePropName}`] = lastOperation.oldInverseValue;
    }
  }

  // Remove any additional operations that were pushed onto the stack due to synchronization
  while (operationStack.length > initialStackLength) {
    operationStack.pop();
  }
}


export function redo() {
  if (redoStack.length === 0) return;

  const lastOperation = redoStack.pop()!;
  operationStack.push(lastOperation);

  if (lastOperation.operationType === 'add') {
    lastOperation.target[`add${lastOperation.propName.charAt(0).toUpperCase() + lastOperation.propName.slice(1)}`](lastOperation.newValue);
  } else if (lastOperation.operationType === 'remove') {
    lastOperation.target[`remove${lastOperation.propName.charAt(0).toUpperCase() + lastOperation.propName.slice(1)}`](lastOperation.oldValue);
  } else {
    lastOperation.target[lastOperation.propName] = lastOperation.newValue;
  }
}

export function defineOneToOne(target: any, propName: string, inversePropName: string) {
  const privatePropName = `_${propName}`;

  Object.defineProperty(target, propName, {
    get() {
      return this[privatePropName];
    },
    set(newValue: any) {
      const oldValue = this[privatePropName];
      if (oldValue === newValue) return;

      // Push the operation to the operationStack
      operationStack.push({
        operationType: 'set',
        target: this,
        propName: propName,
        inversePropName: inversePropName,
        oldValue: oldValue,
        newValue: newValue,
        oldInverseValue: newValue ? newValue[`_${inversePropName}`] : undefined
      });

      // Disconnect the old value if it exists
      if (oldValue) {
        oldValue[`_${inversePropName}`] = undefined;
      }

      // Connect the new value if it exists
      if (newValue) {
        newValue[`_${inversePropName}`] = this;
      }

      this[privatePropName] = newValue;
    }
  });
}


export function defineOneToMany(target: any, propName: string, inversePropName: string) {
  const privatePropName = `_${propName}`;
  target[privatePropName] = [];

  Object.defineProperty(target, propName, {
    get() {
      return this[privatePropName];
    }
  });

  target[`add${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function (item: any) {
    if (!this[privatePropName].includes(item)) {
      this[privatePropName].push(item);

      operationStack.push({
        operationType: 'add',
        target: this,
        propName: propName,
        inversePropName: inversePropName,
        oldValue: undefined,
        newValue: item,
        oldInverseValue: item[`_${inversePropName}`]
      });

      item[`_${inversePropName}`] = this;
    }
  };

  target[`remove${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function (item: any) {
    const index = this[privatePropName].indexOf(item);
    if (index > -1) {
      this[privatePropName].splice(index, 1);

      operationStack.push({
        operationType: 'remove',
        target: this,
        propName: propName,
        inversePropName: inversePropName,
        oldValue: item,
        newValue: undefined,
        oldInverseValue: item[`_${inversePropName}`]
      });

      item[`_${inversePropName}`] = undefined;
    }
  };
}

export function defineManyToOne(target: any, propName: string, inversePropName: string) {
  const privatePropName = `_${propName}`;

  Object.defineProperty(target, propName, {
    get() {
      return this[privatePropName];
    },
    set(newValue: any) {
      const oldValue = this[privatePropName];
      if (oldValue === newValue) return;

      // Push the operation to the operationStack
      operationStack.push({
        operationType: 'set',
        target: this,
        propName: propName,
        inversePropName: inversePropName,
        oldValue: oldValue,
        newValue: newValue,
        oldInverseValue: newValue ? newValue[`_${inversePropName}`] : undefined
      });

      // Disconnect the old value if it exists
      if (oldValue) {
        const index = oldValue[`_${inversePropName}`].indexOf(this);
        if (index > -1) {
          oldValue[`_${inversePropName}`].splice(index, 1);
        }
      }

      // Connect the new value if it exists
      if (newValue) {
        newValue[`_${inversePropName}`].push(this);
      }

      this[privatePropName] = newValue;
    }
  });
}


 
export function defineManyToMany(target: any, propName: string, inversePropName: string) {
  const privatePropName = `_${propName}`;
  target[privatePropName] = [];

  Object.defineProperty(target, propName, {
    get() {
      return this[privatePropName];
    }
  });

  target[`add${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function(item: any) {
    if (this[privatePropName].includes(item)) return;

    // Push the operation to the operationStack
    operationStack.push({
      operationType: 'add',
      target: this,
      propName: propName,
      inversePropName: inversePropName,
      newValue: item,
      oldValue: this,
      oldInverseValue: this
    });

    // Add the item to the new parent's array
    this[privatePropName].push(item);

    // Add this object to the new item's array
    if (!item[`_${inversePropName}`].includes(this)) {
      item[`_${inversePropName}`].push(this);
    }
  };

  target[`remove${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function(item: any) {
    const index = this[privatePropName].indexOf(item);
    if (index === -1) return;

    // Push the operation to the operationStack
    operationStack.push({
      operationType: 'remove',
      target: this,
      propName: propName,
      inversePropName: inversePropName,
      newValue: item,  // Include the item being removed as newValue
      oldValue: this,
      oldInverseValue: this
    });

    // Remove the item from the current parent's array
    this[privatePropName].splice(index, 1);

    // Remove this object from the item's array
    const inverseIndex = item[`_${inversePropName}`].indexOf(this);
    if (inverseIndex !== -1) {
      item[`_${inversePropName}`].splice(inverseIndex, 1);
    }
  };
}

