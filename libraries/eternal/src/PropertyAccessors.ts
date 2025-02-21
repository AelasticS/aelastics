import { State } from "./State";
import { PropertyMeta, TypeMeta } from "./handlers/MetaDefinitions";
import { isUUIDReference } from "./utils";
import { createObservableEntityArray } from "./handlers/ArrayHandlers";
import { createObservableEntitySet } from "./handlers/MapSetHandlers";
import { createObservableEntityMap } from "./handlers/MapSetHandlers";
import { EternalStore } from "./EternalStore";
import { EternalObject } from "./handlers/InternalTypes";

// check access and return correct version of object
function checkReadAccess(obj: EternalObject, store: EternalStore): EternalObject {
    const state = store.getState();
    const isFrozen = state.isObjectFrozen(obj);
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
    if (store.getState().isObjectFrozen(obj)) {
        throw new Error(`Cannot modify property "${key}" of the fixed object with uuid "${obj.uuid}"`);
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
    for (const [key, propertyMeta] of typeMeta.properties) {
        const privateKey = `_${key}`;

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
        // TODO add to changelog
        let setter: (this: EternalObject, value: any) => void;
        if (propertyMeta.type === "array" || propertyMeta.type === "set" || propertyMeta.type === "map") {
            setter = function () {
                throw new Error(`Cannot directly assign to collection property "${key}" of the object with uuid "${this.uuid}"`);
            };
        } else if (propertyMeta.type === "object") {
            setter = function (this: EternalObject, value: EternalObject) {
                // Prevent redundant updates
                if (this[privateKey] === value.uuid && store.isInUpdateMode()) {
                    return;
                }
                // check if allowed to update and return new version if allowed
                const obj = checkWriteAccess(this, store, key);
                obj[privateKey] = value.uuid;

                // Ensure bidirectional relationships are updated correctly
                if (propertyMeta.inverseType && propertyMeta.inverseProp) {
                    obj[`_updateInverse_${key}`](value); // Call precomputed function
                }
            };
        } else {
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
        // TODO remove this extra function calls layer
        Object.defineProperty(prototype, key,
            { get() { return getter.call(this); }, set(v) { setter.call(this, v); } }); 
            // { get: getter, set: setter } );

        // Initialize observable collections
        if (propertyMeta.type === "array") {
            Object.defineProperty(prototype, privateKey, {
                value: createObservableEntityArray([], typeMeta.properties),
                writable: true,
                enumerable: false,
            });
        } else if (propertyMeta.type === "set") {
            Object.defineProperty(prototype, privateKey, {
                value: createObservableEntitySet(new Set(), typeMeta.properties),
                writable: true,
                enumerable: false,
            });
        } else if (propertyMeta.type === "map") {
            Object.defineProperty(prototype, privateKey, {
                value: createObservableEntityMap(new Map(), typeMeta.properties),
                writable: true,
                enumerable: false,
            });
        }

        // Precompute and bind inverse relationship updater
        if (propertyMeta.inverseType && propertyMeta.inverseProp) {
            const inverseUpdater = generateInverseUpdater(propertyMeta);
            prototype[`_updateInverse_${key}`] = function (this: any, value: any) {
                return inverseUpdater.call(this, value);
            };
        }
    }
}

function generateInverseUpdater(propertyMeta: PropertyMeta) {

    // TODO: check versioning

    const inversePrivateKey = `_${propertyMeta.inverseProp}`;

    if (propertyMeta.type === "array") {
        return function (this: any, newValue: any) {
            const oldRelatedObject = this[inversePrivateKey];
            if (oldRelatedObject) {
                oldRelatedObject[inversePrivateKey] = oldRelatedObject[inversePrivateKey].filter(
                    (obj: any) => obj.uuid !== this.uuid
                );
            }

            const newRelatedObject = newValue ? newValue[inversePrivateKey] : undefined;
            if (newRelatedObject) {
                newRelatedObject[inversePrivateKey].push(this);
            }
        };
    }

    if (propertyMeta.type === "set") {
        return function (this: any, newValue: any) {
            const oldRelatedObject = this[inversePrivateKey];
            if (oldRelatedObject) {
                oldRelatedObject[inversePrivateKey].delete(this);
            }

            const newRelatedObject = newValue ? newValue[inversePrivateKey] : undefined;
            if (newRelatedObject) {
                newRelatedObject[inversePrivateKey].add(this);
            }
        };
    }

    if (propertyMeta.type === "map") {
        return function (this: any, newValue: any) {
            const oldRelatedObject = this[inversePrivateKey];
            if (oldRelatedObject) {
                oldRelatedObject[inversePrivateKey].delete(this.uuid);
            }

            const newRelatedObject = newValue ? newValue[inversePrivateKey] : undefined;
            if (newRelatedObject) {
                newRelatedObject[inversePrivateKey].set(this.uuid, this);
            }
        };
    }

    // Default case: one-to-one relationship
    return function (this: any, newValue: any) {
        const oldRelatedObject = this[inversePrivateKey];
        if (oldRelatedObject === this) {
            this[inversePrivateKey] = undefined;
        }
        if (newValue) {
            newValue[inversePrivateKey] = this;
        }
    };
}

