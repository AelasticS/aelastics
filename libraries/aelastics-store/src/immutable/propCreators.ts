// The main utility function for defining Object-to-Object relationships.
export function defineOneToOne(target: any, propName: string, inversePropName: string) {
    const privatePropName = `_${propName}`;
    
    Object.defineProperty(target, propName, {
      get() {
        return this[privatePropName];
      },
      set(newValue: any) {
        const oldValue = this[privatePropName];
        if (oldValue === newValue) return;
  
        if (oldValue) {
          oldValue[`_${inversePropName}`] = undefined;
        }
  
        this[privatePropName] = newValue;
  
        if (newValue) {
          newValue[`_${inversePropName}`] = this;
        }
      }
    });
  }
  

// Define the One-to-Many relationship function
export function defineOneToMany(target: any, propName: string, inversePropName: string) {
    const privatePropName = `_${propName}`;
    target[privatePropName] = [];
  
    Object.defineProperty(target, propName, {
      get() {
        return this[privatePropName];
      }
    });
  
    target[`add${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function(item: any) {
      if (this[privatePropName].includes(item)) return;
  
      // Remove the item from the old parent's array
      if (item[inversePropName]) {
        const index = item[inversePropName][privatePropName].indexOf(item);
        if (index !== -1) {
          item[inversePropName][privatePropName].splice(index, 1);
        }
      }
  
      // Add the item to the new parent's array
      this[privatePropName].push(item);
      item[`_${inversePropName}`] = this;
    };
  
    target[`remove${propName.charAt(0).toUpperCase() + propName.slice(1)}`] = function(item: any) {
      const index = this[privatePropName].indexOf(item);
      if (index === -1) return;
  
      // Remove the item from the current parent's array
      this[privatePropName].splice(index, 1);
      item[`_${inversePropName}`] = undefined;
    };
  }
  

  // Define the Many-to-One relationship function
export function defineManyToOne(target: any, propName: string, inversePropName: string) {
    const privatePropName = `_${propName}`;
  
    Object.defineProperty(target, propName, {
      get() {
        return this[privatePropName];
      },
      set(newValue: any) {
        const oldValue = this[privatePropName];
        if (oldValue === newValue) return;
  
        // Remove this object from the old parent's array
        if (oldValue) {
          const index = oldValue[`_${inversePropName}`].indexOf(this);
          if (index !== -1) {
            oldValue[`_${inversePropName}`].splice(index, 1);
          }
        }
  
        // Set the new value
        this[privatePropName] = newValue;
  
        // Add this object to the new parent's array
        if (newValue) {
          newValue[`_${inversePropName}`].push(this);
        }
      }
    });
  }
  
  // Define the Many-to-Many relationship function
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
  
      // Remove the item from the current parent's array
      this[privatePropName].splice(index, 1);
  
      // Remove this object from the item's array
      const inverseIndex = item[`_${inversePropName}`].indexOf(this);
      if (inverseIndex !== -1) {
        item[`_${inversePropName}`].splice(inverseIndex, 1);
      }
    };
  }
  