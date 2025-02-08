import { State } from "./State";
import { PropertyMeta, TypeMeta } from "./handlers/MetaDefinitions";
import { isUUIDReference } from "./utils";
import { createObservableEntityArray } from "./handlers/ArrayHandlers";
import { createObservableEntitySet } from "./handlers/MapSetHandlers";
import { createObservableEntityMap } from "./handlers/MapSetHandlers";
import { EternalStore } from "./EternalStore";

/** Adds optimized property accessors to a dynamically generated class prototype */
export function addPropertyAccessors(prototype: any, typeMeta: TypeMeta, store: EternalStore) {
    for (const [key, propertyMeta] of typeMeta.properties) {
        const privateKey = `_${key}`;

        // Generate optimized getter
        let getter: (this: any) => any;
        if (propertyMeta.type === "object") {
            getter = function (this: any) {
                return store.getObject(this[privateKey]); // Directly resolve UUIDs
            };
        } else {
            getter = function (this: any) {
                return this[privateKey]; // Directly return stored value
            };
        }

        // Generate optimized setter
        let setter: (this: any, value: any) => void;
        if (propertyMeta.type === "array" || propertyMeta.type === "set" || propertyMeta.type === "map") {
            setter = function () {
                throw new Error(`Cannot directly assign to collection property "${key}". Use methods like .push(), .set(), or .add() instead.`);
            };
        } else if (propertyMeta.type === "object") {
            setter = function (this: any, value: any) {
                if (!store.isInProduceMode()) {
                    throw new Error(`Cannot modify property "${key}" outside of produce()`);
                }

                // Prevent modification of frozen objects
                if (store.getState().isFrozen(this)) {
                    throw new Error(`Cannot modify frozen object ${this.uuid}`);
                }

                // Prevent redundant updates
                if (this[privateKey] === value) {
                    return;
                }

                this[privateKey] = isUUIDReference(value, propertyMeta.type) ? value.uuid : value;

                // Track changes for versioning
                store.getState().trackVersionedObject(this);

                // Ensure bidirectional relationships are updated correctly
                if (propertyMeta.inverseType && propertyMeta.inverseProp) {
                    this[`_updateInverse_${key}`](value); // Call precomputed function
                }
            };
        } else {
            setter = function (this: any, value: any) {
                if (!store.isInProduceMode()) {
                    throw new Error(`Cannot modify property "${key}" outside of produce()`);
                }

                // Prevent modification of frozen objects
                if (store.getState().isFrozen(this)) {
                    throw new Error(`Cannot modify frozen object ${this.uuid}`);
                }

                // Prevent redundant updates
                if (this[privateKey] === value) {
                    return;
                }

                this[privateKey] = value;

                // Track changes for versioning
                store.getState().trackVersionedObject(this);
            };
        }

        // Define property on prototype
        Object.defineProperty(prototype, key, { get: getter, set: setter });

        // Initialize observable collections
        if (propertyMeta.type === "array") {
            Object.defineProperty(prototype, privateKey, {
                value: createObservableEntityArray([], store.getState(), typeMeta.properties),
                writable: true,
                enumerable: false,
            });
        } else if (propertyMeta.type === "set") {
            Object.defineProperty(prototype, privateKey, {
                value: createObservableEntitySet(new Set(), store.getState(), typeMeta.properties),
                writable: true,
                enumerable: false,
            });
        } else if (propertyMeta.type === "map") {
            Object.defineProperty(prototype, privateKey, {
                value: createObservableEntityMap(new Map(), store.getState(), typeMeta.properties),
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

