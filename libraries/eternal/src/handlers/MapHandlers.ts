import { makePrivatePropertyKey} from "../utils"
import { createObservableMap, MapHandlers } from "@aelastics/observables"
import { ObservableExtra } from "../types"
import { checkReadAccess, checkWriteAccess } from "../PropertyAccessors"
import { EternalStore } from "../EternalStore"
import { PropertyMeta } from "../meta/InternalSchema"

// Convert value UUID to Object
const toValueObject = (item: any, store: EternalStore, propDes: PropertyMeta) =>
    propDes.itemType === "object" && item ? store.getObject(item) : item

// Convert key UUID to Object
const toKeyObject = (item: any, store: EternalStore, propDes: PropertyMeta) =>
  propDes.keyType === "object" && item ? store.getObject(item) : item

// Convert value object to UUID if needed
const valueToUUID = (value: any, propDes: PropertyMeta): any =>
    propDes.itemType === "object" && value ? value.uuid : value

// Convert key object to UUID if needed
const keyToUUID = (value: any, propDes: PropertyMeta): any =>
  propDes.keyType === "object" && value ? value.uuid : value



export const createImmutableMapHandlers = <K, V>({ store, object, propDes }: ObservableExtra): MapHandlers<K, V> => ({
  /** Ensure values stored in the map are UUIDs if applicable */
  set: (target: Map<K, V>, key: K, value: V) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const newValue = valueToUUID(value, propDes)
    const newKey = keyToUUID(key, propDes)
    const obj = checkWriteAccess(object, store, propDes.qName)
    const res = obj[privateKey].set(newKey, newValue)
    return [false, res]
  },

  /** Get value by key */
  get: (target: Map<K, V>, key: K) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const newKey = keyToUUID(key, propDes)
    const newValue = obj[privateKey].get(newKey)
    const res = toValueObject(newValue, store, propDes)
    return [false, res]
  },

  /** Check if key exists */
  has: (target: Map<K, V>, key: K) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const newKey = keyToUUID(key, propDes)
    return [false, obj[privateKey].has(newKey)]
  },

  /** Delete entry from map */
  delete: (target: Map<K, V>, key: K) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const newKey = keyToUUID(key, propDes)
    const res = obj[privateKey].delete(newKey)
    return [false, res]
  },

  /** Clear all entries from map */
  clear: (target: Map<K, V>) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const res = obj[privateKey].clear()
    return [false, res]
  },

  /** Get size of map */
  size: (target: Map<K, V>) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const res = obj[privateKey].size
    return [false, res]
  },

  /** Get keys iterator */
  keys: (target: Map<K, V>) => {
    const obj = checkReadAccess(object, store)

    const key = makePrivatePropertyKey(propDes.qName)
    const result = Array.from(obj[key].keys())
      .map((k) => toKeyObject(k, store, propDes))
      [Symbol.iterator]()
    return [false, result]
  },

  /** Get values iterator */
  values: (target: Map<K, V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = Array.from(obj[key].values())
      .map((v) => toValueObject(v, store, propDes))
      [Symbol.iterator]()
    return [false, result]
  },

  /** Get entries iterator */
  entries: (target: Map<K, V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = (<[[K, V]]>Array.from(obj[key].entries()))
      .map(([k, v]) => [toKeyObject(k, store, propDes), toValueObject(v, store, propDes)] as [K, V])
      [Symbol.iterator]()
    return [false, result]
  },

  /** Execute function for each entry */
  forEach: (target: Map<K, V>, callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = obj[key].forEach((value: V, key: K, map: Map<K, V>) => {
      const newKey = toKeyObject(key, store, propDes)
      const newValue = toValueObject(value, store, propDes)
      callback.call(thisArg, newValue, newKey, map)
    })
    return [false, result]
  },

  /** Handle Symbol.iterator */
  [Symbol.iterator]: (target: Map<K, V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = (<[[K, V]]>Array.from(obj[key][Symbol.iterator]()))
      .map(([k, v]) => [toKeyObject(k, store, propDes), toValueObject(v, store, propDes)] as [K, V])
      [Symbol.iterator]()
    return [false, result]
  },
})

/** Helper function to create observable maps */
export function createImmutableMap<K, V>(map: Map<K, V>, observableExtra: ObservableExtra): Map<K, V> {
  return createObservableMap(map, createImmutableMapHandlers<K, V>(observableExtra))
}
