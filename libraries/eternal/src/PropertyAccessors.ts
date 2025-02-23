import { TypeMeta } from "./handlers/MetaDefinitions";
import { EternalStore } from "./EternalStore";
import { EternalObject } from "./handlers/InternalTypes";
import { isObjectFrozen, makePrivatePropertyKey, makeUpdateInverseKey, removeElement } from "./utils";


// check access and return correct version of object
function checkReadAccess(obj: EternalObject, store: EternalStore): EternalObject {
    const state = store.getState();
    const isFrozen = isObjectFrozen(obj);
    const isInUpdateMode = store.isInUpdateMode();

    if (isInUpdateMode) {
        if (obj.nextVersion) {
            const nextVersion = obj.nextVersion.deref();
            if (!isFrozen && state.isCreatedInState(nextVersion)) {
                return nextVersion;
            }
            if (!isFrozen) {
                throw new Error(`Reference to an object ${obj.uuid} not from the current state.`);
            }
        }
        return obj;
    }
    if (!isFrozen && obj.nextVersion && !state.isMemberOfState(obj)) {
        throw new Error(
            `Invalid reference to object ${obj.uuid} from a past state.\n` +
            `Use 'store.getObject(uuid)' to get the current version or 'store.getFromState(uuid)' to get the frozen object.`
        );
    }
    return obj;
}

function checkWriteAccess(obj: EternalObject, store: EternalStore, key: string): EternalObject {

    // if not allowed update throw error
    if (isObjectFrozen(obj)) {
        throw new Error(`Cannot modify property "${key}" of the frozen object with uuid "${obj.uuid}"`);
    }
    // if not in update mode throw error
    if (!store.isInUpdateMode()) {
        throw new Error(`Cannot modify the object with uuid "${obj.uuid} outside of update mode`);
    }

    // if obj is from old state 
    if (store.getState().isFromOlderState(obj)) {
        if (!obj.nextVersion) { // has no new version, create and return new version
            return store.getState().createNewVersion(obj);
        }
        else { // has new version, return new version
            const nextVersion = obj.nextVersion.deref();
            // return only if new version belongs to the current state
            if (store.getState().isCreatedInState(nextVersion)) {
                return nextVersion;
            }
            else {
                throw new Error(`Reference to an object ${obj.uuid} not from the current state.`);
            }
        }
    }
    // obj is from current state
    return obj;
}



/** Adds optimized property accessors to a dynamically generated class prototype */
export function addPropertyAccessors(prototype: any, typeMeta: TypeMeta, store: EternalStore) {

    // type for inverse relationship updater
    type inverseUpdater = (obj: EternalObject, oldUUID: string, value?: EternalObject) => void;

    for (const [key, propertyMeta] of typeMeta.properties) {
        const privateKey = makePrivatePropertyKey(key);
        const inverseUpdaterKey = makeUpdateInverseKey(key);
        const privateInverseKey = propertyMeta.inverseProp?makePrivatePropertyKey(propertyMeta.inverseProp):"";

        // Generate optimized getter
        let getter: (this: EternalObject) => any;
        if (propertyMeta.type === "object") {
            getter = function (this: EternalObject) {
                let obj = checkReadAccess(this, store);
                return store.getObject(obj[privateKey]); // Directly resolve UUIDs
            };
        } else {
            getter = function (this: any) {
                let obj = checkReadAccess(this, store);
                return obj[privateKey]; // Directly return stored value
            };
        }

        // Generate optimized setter
        let setter: (this: EternalObject, value: any) => void;

        // TODO add to changelog

        if (propertyMeta.type === "array" || propertyMeta.type === "set" || propertyMeta.type === "map") {
            setter = function () {
                throw new Error(`Cannot directly assign to collection property "${key}" of an object"`);
            };
        } else if (propertyMeta.type === "object") {
            setter = function (this: EternalObject, value: EternalObject | undefined) {
                // Prevent redundant updates
                if (this[privateKey] === value?.uuid && store.isInUpdateMode()) {
                    return;
                }
                // check if allowed to update and return new version if allowed
                const obj = checkWriteAccess(this, store, key);
                const oldUUID = obj[privateKey] // get old value
                obj[key] = value?.uuid; // update value
                // Ensure bidirectional relationships are updated correctly
                if (propertyMeta.inverseType && propertyMeta.inverseProp && (oldUUID || value)) {
                    // Get precomputed inverse updater function

                    const updater: inverseUpdater | undefined = obj[inverseUpdaterKey];
                    if (!updater) {
                        throw new Error(`Inverse updater function for property "${key}" is undefined.`);
                    }
                    updater(obj, oldUUID, value); // Call precomputed function
                }
            };
        } else { // primitive type
            setter = function (this: EternalObject, value: any) {
                // Prevent redundant updates
                if (this[privateKey] === value && store.isInUpdateMode()) {
                    return;
                }
                // check if allowed to update and return new version if allowed
                const obj = checkWriteAccess(this, store, key);
                obj[privateKey] = value;
            };
        }
        // Define property on prototype
        Object.defineProperty(prototype, key, { get: getter, set: setter });
        // Precompute and bind inverse relationship updater
        if (propertyMeta.inverseType && propertyMeta.inverseProp) {
            switch (propertyMeta.inverseType) {
                case "object":
                    prototype[inverseUpdaterKey] = one2one(store, key, privateInverseKey);
                    break;
                case "array":
                    prototype[inverseUpdaterKey] = one2Array(store, key, privateInverseKey);
                    break;
                case "map":
                    prototype[inverseUpdaterKey] = one2Map(store, key, privateInverseKey);
                    break;
                case "set":
                    prototype[inverseUpdaterKey] = one2Set(store, key, privateInverseKey);
                    break;
            }
        }
    }


    function one2one(store: EternalStore, key: string, privateInverseKey: string): inverseUpdater {

        return function (obj: EternalObject, oldUUID: string, value?: EternalObject) {
            let oldObj: EternalObject | undefined;
            //  check if old value is present and get the correct version of it  
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
                oldObj = checkWriteAccess(oldObj, store, key);
                oldObj[privateInverseKey] = undefined; // remove inverse relationship
            }
            let newObj: EternalObject | undefined;
            //  check if new value is present and get the correct version of it
            if (value) {
                newObj = checkWriteAccess(value, store, key);
                const oldUUID = newObj[privateInverseKey]; // get old value

                if (oldUUID && (oldObj = store.getObject(oldUUID))) {
                    oldObj = checkWriteAccess(oldObj, store, key); // get the correct version of it
                    oldObj[privateInverseKey] = undefined; // remove inverse relationship
                }
                newObj[privateInverseKey] = obj.uuid;
            }
        }
    }

    function one2Array(store: EternalStore, key: string, privateInverseKey: string): inverseUpdater {
        return function (obj: EternalObject, oldUUID: string, value?: EternalObject) {
            let oldObj: EternalObject | undefined;

            //  check if old value is present and get the correct version of it  
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
                oldObj = checkWriteAccess(oldObj, store, key);
                removeElement(oldObj[privateInverseKey], obj.uuid) // remove inverse relationship
            }
            //  check if new value is present and get the correct version of it
            if (value) {
                const newObj = checkWriteAccess(value, store, key);
                newObj[privateInverseKey].push(obj.uuid);
            }
        }
    }

    function one2Map(store: EternalStore, key: string, privateInverseKey: string): inverseUpdater {
        return function (obj: EternalObject, oldUUID: string, value?: EternalObject) {
            let oldObj: EternalObject | undefined;

            //  check if old value is present and get the correct version of it  
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
                oldObj = checkWriteAccess(oldObj, store, key);
                const mapObj: Map<String, EternalObject> = oldObj[privateInverseKey]
                mapObj.delete(obj.uuid) // remove inverse relationship
            }
            //  check if new value is present and get the correct version of it
            if (value) {
                const newObj = checkWriteAccess(value, store, key);
                const map: Map<string, string> = newObj[privateInverseKey]
                map.set(obj.uuid, obj.uuid);
            }
        }
    }

    function one2Set(store: EternalStore, key: string, privateInverseKey: string): inverseUpdater {
        return function (obj: EternalObject, oldUUID: string, value?: EternalObject) {
            let oldObj: EternalObject | undefined;

            //  check if old value is present and get the correct version of it
            // ue is present and get the correct version of it  
            if (oldUUID && (oldObj = store.getObject(oldUUID))) {
                oldObj = checkWriteAccess(oldObj, store, key);
                const setObj: Set<String> = oldObj[privateInverseKey]
                setObj.delete(obj.uuid) // remove inverse relationship
            }
            //  check if new value is present and get the correct version of it
            if (value) {
                const newObj = checkWriteAccess(value, store, key);
                const setObj: Set<string> = newObj[privateInverseKey]
                setObj.add(obj.uuid);
            }
        }
    }
}
