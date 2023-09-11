export function createObservableArray<T>(arr: T[]): T[] {
    return new Proxy(arr, {
        set(target: T[], key: PropertyKey, value: any): boolean {
            if (key !== 'length' && target[key as any] !== value) {
                console.log(`Setting value at index ${key.toString()} to`, value);
            }
            target[key as any] = value;
            return true;
        },
        deleteProperty(target: T[], key: PropertyKey): boolean {
            console.log(`Deleting value at index ${key.toString()}`);
            delete target[key as any];
            return true;
        },
        get(target: T[], key: PropertyKey) {
            if (key === 'push') {
                return function(...args: T[]): number {
                    console.log(`Pushing values`, args);
                    return Array.prototype.push.apply(target, args);
                };
            } else if (key === 'splice') {
                return function(start: number, deleteCount: number = 0, ...items: T[]): T[] {
                    console.log(`Splicing array. Start: ${start}, Delete Count: ${deleteCount}, Items:`, items);
                    return Array.prototype.splice.apply(target, [start, deleteCount, ...items]);
                };
            }
            return target[key as any];
        }
    });
}
/*
const observedArray = createObservableArray<number>([1, 2, 3]);

observedArray.push(4, 5);  // Logs: Pushing values [ 4, 5 ]
observedArray.splice(1, 1, 99);  // Logs: Splicing array. Start: 1, Delete Count: 1, Items: [ 99 ]

*/

export function createObservableMap<K, V>(map: Map<K, V>): Map<K, V> {
    return new Proxy(map, {
        set(target: Map<K, V>, key: PropertyKey, value: any): boolean {
            console.error("The set trap shouldn't be triggered for Maps.");
            return false;
        },
        get(target: Map<K, V>, key: PropertyKey) {
            if (key === 'set') {
                return function(k: K, v: V) {
                    console.log(`Setting key ${k} with value`, v);
                    return target.set(k, v);
                };
            } else if (key === 'delete') {
                return function(k: K) {
                    console.log(`Deleting key ${k}`);
                    return target.delete(k);
                };
            } else if (key === 'clear') {
                return function() {
                    console.log(`Clearing the map`);
                    return target.clear();
                };
            }
            return (target as any)[key];
        }
    });
}

/*
const observedMap = createObservableMap<string, number>(new Map());

observedMap.set("a", 1);  // Logs: Setting key a with value 1
observedMap.set("b", 2);  // Logs: Setting key b with value 2
observedMap.delete("a");  // Logs: Deleting key a
observedMap.clear();  // Logs: Clearing the map
*/

export function createObservableSet<T>(set: Set<T>): Set<T> {
    return new Proxy(set, {
        get(target: Set<T>, key: PropertyKey) {
            if (key === 'add') {
                return function(value: T) {
                    console.log(`Adding value`, value);
                    return target.add(value);
                };
            } else if (key === 'delete') {
                return function(value: T) {
                    console.log(`Deleting value`, value);
                    return target.delete(value);
                };
            } else if (key === 'clear') {
                return function() {
                    console.log(`Clearing the set`);
                    return target.clear();
                };
            }
            return (target as any)[key];
        }
    });
}

/*
const observedSet = createObservableSet<number>(new Set());

observedSet.add(1);     // Logs: Adding value 1
observedSet.add(2);     // Logs: Adding value 2
observedSet.delete(1);  // Logs: Deleting value 1
observedSet.clear();    // Logs: Clearing the set

*/