import { StoreClass } from "./StoreClass";
import { StoreObject } from "../handlers/InternalTypes";
import { checkWriteAccess } from "./PropertyAccessors";
import { makePrivatePropertyKey, removeElement } from "./utils";
import { PropertyMeta } from "../meta/InternalSchema";

// type for inverse relationship updater
export type inverseUpdater = (
  obj: StoreObject,
  disconnectedObject?: string | StoreObject,
  connectedObject?: string | StoreObject
) => void 


export function array2one(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
    const key = propertyMeta.qName;
    const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
    const privateKey = makePrivatePropertyKey(key);
  
    return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
      let oldObj: StoreObject | undefined;
  
      // Check if old element is present and get the correct version of it
      if (disconnectedObject) {
        const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
        if (oldUUID && (oldObj = store.getObject(oldUUID))) {
          oldObj = checkWriteAccess(oldObj, store, key);
          oldObj[privateInverseKey] = undefined; // Remove inverse relationship
        }
      }
  
      let newObj: StoreObject | undefined;
  
      // Check if new value is present and get the correct version of it
      if (connectedObject) {
        const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
        if (newUUID && (newObj = store.getObject(newUUID))) {
          newObj = checkWriteAccess(newObj, store, key);
          const oldUUID = newObj[privateInverseKey]; // Get old value
  
          if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key); // Get the correct version of it
            removeElement(oldObj[privateKey], obj.uuid); // Remove inverse relationship
          }
          newObj[privateInverseKey] = obj.uuid; // Set new inverse relationship
        }
      }
    };
  }

  export function array2array(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
    const key = propertyMeta.qName;
    const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
    const privateKey = makePrivatePropertyKey(key);
  
    return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
      let oldObj: StoreObject | undefined;
  
      // Check if old element is present and get the correct version of it
      if (disconnectedObject) {
        const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
        if (oldUUID && (oldObj = store.getObject(oldUUID))) {
          oldObj = checkWriteAccess(oldObj, store, key);
          removeElement(oldObj[privateInverseKey], obj.uuid); // Remove inverse relationship
        }
      }
  
      let newObj: StoreObject | undefined;
  
      // Check if new value is present and get the correct version of it
      if (connectedObject) {
        const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
        if (newUUID && (newObj = store.getObject(newUUID))) {
          newObj = checkWriteAccess(newObj, store, key);
          newObj[privateInverseKey].push(obj.uuid); // Add inverse relationship
        }
      }
    };
  }

  export function array2set(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
    const key = propertyMeta.qName;
    const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
    const privateKey = makePrivatePropertyKey(key);
  
    return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
      let oldObj: StoreObject | undefined;
  
      // Check if old element is present and get the correct version of it
      if (disconnectedObject) {
        const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
        if (oldUUID && (oldObj = store.getObject(oldUUID))) {
          oldObj = checkWriteAccess(oldObj, store, key);
          const setObj: Set<string> = oldObj[privateInverseKey];
          setObj.delete(obj.uuid); // Remove inverse relationship
        }
      }
  
      let newObj: StoreObject | undefined;
  
      // Check if new value is present and get the correct version of it
      if (connectedObject) {
        const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
        if (newUUID && (newObj = store.getObject(newUUID))) {
          newObj = checkWriteAccess(newObj, store, key);
          const setObj: Set<string> = newObj[privateInverseKey];
          setObj.add(obj.uuid); // Add inverse relationship
        }
      }
    };
  }

  export function array2map(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
    const key = propertyMeta.qName;
    const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
    const privateKey = makePrivatePropertyKey(key);
  
    return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
      let oldObj: StoreObject | undefined;
  
      // Check if old element is present and get the correct version of it
      if (disconnectedObject) {
        const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
        if (oldUUID && (oldObj = store.getObject(oldUUID))) {
          oldObj = checkWriteAccess(oldObj, store, key);
          const mapObj: Map<any, any> = oldObj[privateInverseKey];
          mapObj.delete(obj.uuid); // Remove inverse relationship
        }
      }
  
      let newObj: StoreObject | undefined;
  
      // Check if new value is present and get the correct version of it
      if (connectedObject) {
        const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
        if (newUUID && (newObj = store.getObject(newUUID))) {
          newObj = checkWriteAccess(newObj, store, key);
          const mapObj: Map<any, any> = newObj[privateInverseKey];
          mapObj.set(obj.uuid, obj.uuid); // Add inverse relationship
        }
      }
    };
  }

    export function one2one(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            oldObj[privateInverseKey] = undefined; // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            newObj[privateInverseKey] = obj.uuid; // Set new inverse relationship
            }
        }
        };
    }

    export function one2array(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            removeElement(oldObj[privateInverseKey], obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            newObj[privateInverseKey].push(obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function one2set(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            const setObj: Set<string> = oldObj[privateInverseKey];
            setObj.delete(obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            const setObj: Set<string> = newObj[privateInverseKey];
            setObj.add(obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function one2map(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            const mapObj: Map<any, any> = oldObj[privateInverseKey];
            mapObj.delete(obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            const mapObj: Map<any, any> = newObj[privateInverseKey];
            mapObj.set(obj.uuid, obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function set2one(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            oldObj[privateInverseKey] = undefined; // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            newObj[privateInverseKey] = obj.uuid; // Set new inverse relationship
            }
        }
        };
    }

    export function set2array(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            removeElement(oldObj[privateInverseKey], obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            newObj[privateInverseKey].push(obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function set2set(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            const setObj: Set<string> = oldObj[privateInverseKey];
            setObj.delete(obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            const setObj: Set<string> = newObj[privateInverseKey];
            setObj.add(obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function set2map(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            const mapObj: Map<any, any> = oldObj[privateInverseKey];
            mapObj.delete(obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            const mapObj: Map<any, any> = newObj[privateInverseKey];
            const mapKey = propertyMeta.keyType === 'object' ? obj[privateKey].uuid : obj[privateKey];
            mapObj.set(mapKey, obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function map2one(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            oldObj[privateInverseKey] = undefined; // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            newObj[privateInverseKey] = obj.uuid; // Set new inverse relationship
            }
        }
        };
    }

    export function map2array(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            removeElement(oldObj[privateInverseKey], obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            newObj[privateInverseKey].push(obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function map2set(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            const setObj: Set<string> = oldObj[privateInverseKey];
            setObj.delete(obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            const setObj: Set<string> = newObj[privateInverseKey];
            setObj.add(obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    export function map2map(store: StoreClass, propertyMeta: PropertyMeta): inverseUpdater {
        const key = propertyMeta.qName;
        const privateInverseKey = makePrivatePropertyKey(propertyMeta.inverseProp!);
        const privateKey = makePrivatePropertyKey(key);
    
        return function (obj: StoreObject, disconnectedObject?: string | StoreObject, connectedObject?: string | StoreObject) {
        let oldObj: StoreObject | undefined;
    
        // Check if old element is present and get the correct version of it
        if (disconnectedObject) {
            const oldUUID = typeof disconnectedObject === 'string' ? disconnectedObject : disconnectedObject.uuid;
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
            oldObj = checkWriteAccess(oldObj, store, key);
            const mapObj: Map<any, any> = oldObj[privateInverseKey];
            mapObj.delete(obj.uuid); // Remove inverse relationship
            }
        }
    
        let newObj: StoreObject | undefined;
    
        // Check if new value is present and get the correct version of it
        if (connectedObject) {
            const newUUID = typeof connectedObject === 'string' ? connectedObject : connectedObject.uuid;
            if (newUUID && (newObj = store.getObject(newUUID))) {
            newObj = checkWriteAccess(newObj, store, key);
            const mapObj: Map<any, any> = newObj[privateInverseKey];
            mapObj.set(obj.uuid, obj.uuid); // Add inverse relationship
            }
        }
        };
    }

    