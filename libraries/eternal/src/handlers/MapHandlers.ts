import { makePrivatePropertyKey, toObject, toUUID } from "../utils"
import { createObservableMap, MapHandlers } from "@aelastics/observables"
import { ObservableExtra } from "../types"
import { checkReadAccess, checkWriteAccess } from "../PropertyAccessors"

export const createImmutableMapHandlers = <K, V>({ store, object, propDes }: ObservableExtra): MapHandlers<K, V> => ({
  /** Ensure values stored in the map are UUIDs if applicable */
  set: (target: Map<K, V>, key: K, value: V) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const newValue = toUUID(value, propDes)
    const newKey = toUUID(key, propDes)
    const obj = checkWriteAccess(object, store, propDes.qName)
    const res = obj[privateKey].set(newKey, newValue)
    return [false, res]
  },

  /** Get value by key */
  get: (target: Map<K, V>, key: K) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const newKey = toUUID(key, propDes)
    const newValue = obj[privateKey].get(newKey)
    const res = toObject(newValue, store, propDes)
    return [false, res]
  },

  /** Check if key exists */
  has: (target: Map<K, V>, key: K) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const newKey = toUUID(key, propDes)
    return [false, obj[privateKey].has(newKey)]
  },

  /** Delete entry from map */
  delete: (target: Map<K, V>, key: K) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    const newKey = toUUID(key, propDes)
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
      .map((k) => toObject(k, store, propDes))
      [Symbol.iterator]()
    return [false, result]
  },

  /** Get values iterator */
  values: (target: Map<K, V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = Array.from(obj[key].values())
      .map((v) => toObject(v, store, propDes))
      [Symbol.iterator]()
    return [false, result]
  },

  /** Get entries iterator */
  entries: (target: Map<K, V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = (<[[K, V]]>Array.from(obj[key].entries()))
      .map(([k, v]) => [toObject(k, store, propDes), toObject(v, store, propDes)] as [K, V])
      [Symbol.iterator]()
    return [false, result]
  },

  /** Execute function for each entry */
  forEach: (target: Map<K, V>, callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = obj[key].forEach((value: V, key: K, map: Map<K, V>) => {
      const newKey = toObject(key, store, propDes)
      const newValue = toObject(value, store, propDes)
      callback.call(thisArg, newValue, newKey, map)
    })
    return [false, result]
  },

  /** Handle Symbol.iterator */
  [Symbol.iterator]: (target: Map<K, V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = (<[[K, V]]>Array.from(obj[key][Symbol.iterator]()))
      .map(([k, v]) => [toObject(k, store, propDes), toObject(v, store, propDes)] as [K, V])
      [Symbol.iterator]()
    return [false, result]
  },
})

/** Helper function to create observable maps */
export function createImmutableMap<K, V>(map: Map<K, V>, observableExtra: ObservableExtra): Map<K, V> {
  return createObservableMap(map, createImmutableMapHandlers<K, V>(observableExtra))
}
