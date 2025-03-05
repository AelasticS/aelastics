import { createObservableSet, SetHandlers } from "@aelastics/observables"
import { PropertyMeta } from "./MetaDefinitions"
import { makePrivatePropertyKey, toObject, toUUID } from "../utils"
import { checkReadAccess, checkWriteAccess } from "../PropertyAccessors"
import { ObservableExtra } from "../types"

/** Creates handlers for observable sets */
export const createSetHandlers = <V>({ store, object, propDes }: ObservableExtra): SetHandlers<V> => ({
  /** Ensure values stored in the set are UUIDs if applicable */
  add: (target: Set<V>, value: V) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const newValue = toUUID(value, propDes)
    const obj = checkWriteAccess(object, store, propDes.qName)
    const res = obj[privateKey].add(newValue)
    return [false, res]
  },

  /** Delete entry from set */
  delete: (target: Set<V>, value: V) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const newValue = toUUID(value, propDes)
    const obj = checkWriteAccess(object, store, propDes.qName)
    const res = obj[privateKey].delete(newValue)
    return [false, res]
  },

  /** Clear all entries from set */
  clear: (target: Set<V>) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkWriteAccess(object, store, propDes.qName)
    obj[privateKey].clear()
    return [false, undefined]
  },

  /** Check if value exists */
  has: (target: Set<V>, value: V) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const newValue = toUUID(value, propDes)
    const obj = checkReadAccess(object, store)
    return [false, obj[privateKey].has(newValue)]
  },

  /** Get size of set */
  size: (target: Set<V>) => {
    const privateKey = makePrivatePropertyKey(propDes.qName)
    const obj = checkReadAccess(object, store)
    return [false, obj[privateKey].size]
  },

  /** Get values iterator */
  values: (target: Set<V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = Array.from(obj[key].values())
      .map((v) => toObject(v, store, propDes))
      [Symbol.iterator]()
    return [false, result]
  },

  /** Get entries iterator */
  entries: (target: Set<V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const array = Array.from((obj[key] as Set<V>).entries()).map(([v, _]) => {
      const r = <V>toObject(v, store, propDes)
      return [r, r] as [V, V]
    })
    const result = (function* (): IterableIterator<[V, V]> {
      const size = array.length
      for (let i = 0; i < size; i++) {
        yield array[i]
      }
    })()
    return [false, result]
  },

  /** Execute function for each entry */
  forEach: (target: Set<V>, callback: (value: V, value2: V, set: Set<V>) => void, thisArg?: any) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    obj[key].forEach((value: V) => {
      const newValue = toObject(value, store, propDes)
      callback.call(thisArg, newValue, newValue, target)
    })
    return [false, undefined]
  },

  /** Handle Symbol.iterator */
  [Symbol.iterator]: (target: Set<V>) => {
    const obj = checkReadAccess(object, store)
    const key = makePrivatePropertyKey(propDes.qName)
    const result = Array.from(obj[key][Symbol.iterator]())
      .map((v) => toObject(v, store, propDes))
      [Symbol.iterator]()
    return [false, result]
  },
})

/** Helper function to create observable sets */
export function createImmutableSet<V>(set: Set<V>, observableExtra: ObservableExtra): Set<V> {
  return createObservableSet(set, createSetHandlers<V>(observableExtra))
}
