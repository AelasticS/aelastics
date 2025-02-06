// import { JSONPatchOperation } from "fast-json-patch";

import { State } from "./State";

export type JSONPatchOperation = any

export interface ChangeLogEntry {
    uuid: string;
    objectType: string;
    change: "insert" | "update" | "delete";
    changes?: Record<string, any>;
    collectionChanges?: CollectionChange[];
}

interface CollectionChange {
    property: string;
    change: "add" | "remove";
    values: { uuid: string; objectType: string }[];
}

/**
 * Consolidates the change logs across multiple states while preserving history.
 * Ensures valid ordering and removes redundant operations.
 */
export function consolidateChangeLogs(stateLogs: ChangeLogEntry[][]): ChangeLogEntry[] {
    const consolidatedMap = new Map<string, ChangeLogEntry>();

    for (const stateLog of stateLogs) {
        for (const entry of stateLog) {
            const existing = consolidatedMap.get(entry.uuid);

            if (!existing) {
                // First occurrence, add it
                consolidatedMap.set(entry.uuid, { ...entry });
            } else {
                switch (entry.change) {
                    case "insert":
                        // Ignore duplicate inserts if the object is already known
                        break;

                    case "update":
                        if (existing.change === "insert" || existing.change === "update") {
                            // Merge updates: apply field changes and collection updates
                            existing.changes = { ...existing.changes, ...entry.changes };

                            if (entry.collectionChanges) {
                                existing.collectionChanges = [
                                    ...(existing.collectionChanges || []),
                                    ...entry.collectionChanges,
                                ];
                            }

                            consolidatedMap.set(entry.uuid, existing);
                        }
                        break;

                    case "delete":
                        // If an object was never created, ignore the delete
                        if (existing.change === "insert") {
                            // Remove both insert and delete (cancelling out the object)
                            consolidatedMap.delete(entry.uuid);
                        } else {
                            // Mark for deletion
                            consolidatedMap.set(entry.uuid, { uuid: entry.uuid, objectType: entry.objectType, change: "delete" });
                        }
                        break;
                }
            }
        }
    }

    // Return the final consolidated log sorted by appearance order
    return Array.from(consolidatedMap.values());
}

/**
 * Converts a consolidated change log into a JSON Patch array.
 * Applies changes in a structured format for state updates.
 */
export function generateJsonPatch(consolidatedLog: ChangeLogEntry[]): JSONPatchOperation[] {
    const patch: JSONPatchOperation[] = [];

    for (const entry of consolidatedLog) {
        const path = `/${entry.objectType.toLowerCase()}s/${entry.uuid}`;

        switch (entry.change) {
            case "insert":
                patch.push({ op: "add", path, value: { uuid: entry.uuid, objectType: entry.objectType } });
                break;

            case "update":
                if (entry.changes) {
                    for (const [key, value] of Object.entries(entry.changes)) {
                        patch.push({ op: "replace", path: `${path}/${key}`, value });
                    }
                }
                if (entry.collectionChanges) {
                    for (const collectionChange of entry.collectionChanges) {
                        const collectionPath = `${path}/${collectionChange.property}`;
                        if (collectionChange.change === "add") {
                            patch.push({ op: "add", path: collectionPath, value: collectionChange.values });
                        } else if (collectionChange.change === "remove") {
                            patch.push({ op: "remove", path: collectionPath, value: collectionChange.values });
                        }
                    }
                }
                break;

            case "delete":
                patch.push({ op: "remove", path });
                break;
        }
    }

    return patch;
}

/**
 * Applies a JSON Patch to the state, updating objects accordingly.
 */
export function applyJsonPatch(state: State, patch: JSONPatchOperation[]): void {
    for (const operation of patch) {
        const { op, path, value } = operation;
        const segments = path.split("/").filter(Boolean); // Split path into segments

        if (segments.length < 2) continue; // Ensure valid path

        const objectType = segments[0]; // e.g., "users"
        const uuid = segments[1]; // e.g., "123"
        const object:any = state.getObject(uuid);

        if (!object) {
            console.warn(`Object ${uuid} of type ${objectType} not found in state.`);
            continue;
        }

        switch (op) {
            case "add":
                if (segments.length === 2) {
                    // Adding a new object
                    state.addObject(value);
                } else {
                    const prop = segments[2];
                    if (Array.isArray(object[prop])) {
                        object[prop].push(value);
                    } else if (object[prop] instanceof Set) {
                        object[prop].add(value);
                    } else if (object[prop] instanceof Map) {
                        object[prop].set(value.uuid, value);
                    }
                }
                break;

            case "replace":
                if (segments.length === 3) {
                    const prop = segments[2];
                    object[prop] = value;
                }
                break;

            case "remove":
                if (segments.length === 2) {
                    state.deleteObject(uuid);
                } else {
                    const prop = segments[2];
                    if (Array.isArray(object[prop])) {
                        object[prop] = object[prop].filter((item:any) => item.uuid !== value.uuid);
                    } else if (object[prop] instanceof Set) {
                        object[prop].delete(value);
                    } else if (object[prop] instanceof Map) {
                        object[prop].delete(value.uuid);
                    }
                }
                break;
        }
    }
}
