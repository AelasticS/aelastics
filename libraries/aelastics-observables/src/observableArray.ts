export interface ArrayHandlers<T> {
  getByIndex?: (target: T[], index: number, value: T) => [boolean, T]
  setByIndex?: (target: T[], index: number, value: T) => [boolean, T]
  delete?: (target: T[], index: number) => [boolean, boolean]
  push?: (target: T[], ...items: T[]) => [boolean, number?]
  pop?: (target: T[]) => [boolean, T?]
  shift?: (target: T[]) => [boolean, T?]
  unshift?: (target: T[], ...items: T[]) => [boolean, number?]
  splice?: (target: T[], start: number, deleteCount: number, ...items: T[]) => [boolean, T[]?]
  reverse?: (target: T[]) => [boolean, T[]?]
  sort?: (target: T[]) => [boolean, T[]?]
  fill?: (target: T[], value: T, start: number, end: number) => [boolean, T[]?]
  length?: (target: T[], length: number) => [boolean, number?]
  includes?: (target: T[], value: T) => [boolean, boolean?]
  indexOf?: (target: T[], value: T, fromIndex: number) => [boolean, number]
  lastIndexOf?: (target: T[], value: T, fromIndex: number) => [boolean, number]
  find?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => [boolean, T?]
  findIndex?: (
    target: T[],
    callback: (value: T, index: number, array: T[]) => boolean,
    thisArg: any
  ) => [boolean, number?]
  concat?: (target: T[], ...items: T[]) => [boolean, T[]]
  slice?: (target: T[], start?: number, end?: number) => [boolean, T[]]
  map?: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => [boolean, any[]?]
  filter?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => [boolean, T[]?]
  reduce?: (
    target: T[],
    callback: (accumulator: any, value: T, index: number, array: T[]) => any,
    initialValue: any
  ) => [boolean, any?]
  reduceRight?: (
    target: T[],
    callback: (accumulator: any, value: T, index: number, array: T[]) => any,
    initialValue: any
  ) => [boolean, any?]
  every?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => [boolean, boolean?]
  some?: (target: T[], callback: (value: T, index: number, array: T[]) => boolean, thisArg: any) => [boolean, boolean?]
  forEach?: (target: T[], callback: (value: T, index: number, array: T[]) => void, thisArg: any) => [boolean, void?]
  flatMap?: (target: T[], callback: (value: T, index: number, array: T[]) => any, thisArg: any) => [boolean, any[]?]
  flat?: (target: T[], depth: number) => [boolean, any[]?]
  copyWithin?: (target: T[], targetIndex: number, start: number, end: number) => [boolean, T[]?]
  [Symbol.iterator]: (target: T[]) => IterableIterator<T>
  entries?: (target: T[]) => [boolean, IterableIterator<[number, T]>?]
  keys?: (target: T[]) => [boolean, IterableIterator<number>?]
  values?: (target: T[]) => [boolean, IterableIterator<T>?]
  join?: (target: T[], separator: string) => [boolean, string?]
  toStringHandler?: (target: T[]) => [boolean, string?] 
  toLocaleStringHandler?: (target: T[]) => [boolean, string?]
}

export function createObservableArray<T>(arr: T[], handlers: ArrayHandlers<T>, allowMutations: boolean = true): T[] {
  return new Proxy(arr, {
    set(target: T[], key: string | number | symbol, value: any, receiver: any): any {
      if (typeof key === "number" || !isNaN(Number(key))) {
        const index = Number(key)
        if (handlers.setByIndex) {
          const [continueOperation, result] = handlers.setByIndex(target, index, value)
          if (!continueOperation) {
            return result
          }
        }
        return Reflect.set(target, index, value, receiver)
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    },
    deleteProperty(target: T[], key: string | number | symbol): boolean {
      if (typeof key === "number" || !isNaN(Number(key))) {
        const index = Number(key)

        const [continueOperation, result] = handlers.delete?.(target, index) ?? [allowMutations, false]
        if (!continueOperation) {
          return result
        }
        return Reflect.deleteProperty(target, index)
      } else {
        return Reflect.deleteProperty(target, key)
      }
    },
    get(target: T[], key: any | number | symbol, receiver: any): any {
      if (typeof key === "string") {
        switch (key) {
          case "push":
            return (...items: T[]) => {
              const [continueOperation, result] = handlers.push?.(target, ...items) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.push, target, items)
            }
          case "pop":
            return () => {
              const [continueOperation, result] = handlers.pop?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.pop, target, [])
            }
          case "shift":
            return () => {
              const [continueOperation, result] = handlers.shift?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.shift, target, [])
            }
          case "unshift":
            return (...items: T[]) => {
              const [continueOperation, result] = handlers.unshift?.(target, ...items) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.unshift, target, items)
            }
          case "splice":
            return (start: number, deleteCount: number, ...items: T[]) => {
              const [continueOperation, result] = handlers.splice?.(target, start, deleteCount, ...items) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.splice, target, [start, deleteCount, ...items])
            }
          case "reverse":
            return () => {
              const [continueOperation, result] = handlers.reverse?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.reverse, target, [])
            }
          case "sort":
            return (compareFn?: (a: T, b: T) => number) => {
              const [continueOperation, result] = handlers.sort?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.sort, target, [compareFn])
            }
          case "fill":
            return (value: T, start: number = 0, end?: number) => {
              const [continueOperation, result] = handlers.fill?.(target, value, start, end ?? target.length) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype.fill, target, [value, start, end])
            }
          case "length":
            const [continueOperation, lengthResult] = handlers.length?.(target, target.length) ?? [
              allowMutations,
              undefined,
            ]
            if (!continueOperation) {
              return lengthResult
            }
            return Reflect.get(target, "length")
          case "includes":
            return (value: T) => {
              const [continueOperation, includesResult] = handlers.includes?.(target, value) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return includesResult
              }
              return target.includes(value)
            }
          case "indexOf":
            return (value: T, fromIndex: number = 0) => {
              const [continueOperation, indexOfResult] = handlers.indexOf?.(target, value, fromIndex) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return indexOfResult
              }
              return target.indexOf(value, fromIndex)
            }
          case "lastIndexOf":
            return (value: T, fromIndex: number = target.length - 1) => {
              const [continueOperation, lastIndexOfResult] = handlers.lastIndexOf?.(target, value, fromIndex) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return lastIndexOfResult
              }
              return target.lastIndexOf(value, fromIndex)
            }
          case "find":
            return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
              const [continueOperation, findResult] = handlers.find?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return findResult
              }
              return target.find(callback, thisArg)
            }
          case "findIndex":
            return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
              const [continueOperation, findIndexResult] = handlers.findIndex?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return findIndexResult
              }
              return target.findIndex(callback, thisArg)
            }
          case "concat":
            return (...items: [T]) => {
              const [continueOperation, concatResult] = handlers.concat?.(target, ...items) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return concatResult
              }
              return Reflect.apply(Array.prototype.concat, target, items)
            }
          case "slice":
            return (start?: number, end?: number) => {
              const [continueOperation, sliceResult] = handlers.slice?.(target, start, end) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return sliceResult
              }
              return Reflect.apply(Array.prototype.slice, target, [start, end])
            }
          case "map":
            return (callback: (value: T, index: number, array: T[]) => any, thisArg?: any) => {
              const [continueOperation, mapResult] = handlers.map?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return mapResult
              }
              return Reflect.apply(Array.prototype.map, target, [callback, thisArg])
            }
          case "filter":
            return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
              const [continueOperation, filterResult] = handlers.filter?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return filterResult
              }
              return Reflect.apply(Array.prototype.filter, target, [callback, thisArg])
            }
          case "reduce":
            return (callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue?: any) => {
              const [continueOperation, reduceResult] = handlers.reduce?.(target, callback, initialValue) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return reduceResult
              }
              return Reflect.apply(Array.prototype.reduce, target, [callback, initialValue])
            }
          case "reduceRight":
            return (callback: (accumulator: any, value: T, index: number, array: T[]) => any, initialValue?: any) => {
              const [continueOperation, reduceRightResult] = handlers.reduceRight?.(target, callback, initialValue) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return reduceRightResult
              }
              return Reflect.apply(Array.prototype.reduceRight, target, [callback, initialValue])
            }
          case "every":
            return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
              const [continueOperation, everyResult] = handlers.every?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return everyResult
              }
              return Reflect.apply(Array.prototype.every, target, [callback, thisArg])
            }
          case "some":
            return (callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => {
              const [continueOperation, someResult] = handlers.some?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return someResult
              }
              return Reflect.apply(Array.prototype.some, target, [callback, thisArg])
            }
          case "forEach":
            return (callback: (value: T, index: number, array: T[]) => void, thisArg?: any) => {
              const [continueOperation, forEachResult] = handlers.forEach?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return forEachResult
              }
              return Reflect.apply(Array.prototype.forEach, target, [callback, thisArg])
            }
          case "flatMap":
            return (callback: (value: T, index: number, array: T[]) => any, thisArg?: any) => {
              const [continueOperation, flatMapResult] = handlers.flatMap?.(target, callback, thisArg) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return flatMapResult
              }
              return Reflect.apply(Array.prototype.flatMap, target, [callback, thisArg])
            }
          case "flat":
            return (depth: number) => {
              const [continueOperation, flatResult] = handlers.flat?.(target, depth) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return flatResult
              }
              return Reflect.apply(Array.prototype.flat, target, [depth])
            }
          case "copyWithin":
            return (targetIndex: number, start: number, end: number) => {
              const [continueOperation, copyWithinResult] = handlers.copyWithin?.(target, targetIndex, start, end) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return copyWithinResult
              }
              return Reflect.apply(Array.prototype.copyWithin, target, [targetIndex, start, end])
            }
          case "entries":
            return () => {
              const [continueOperation, entriesResult] = handlers.entries?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return entriesResult
              }
              return Reflect.apply(Array.prototype.entries, target, [])
            }
          case "keys":
            return () => {
              const [continueOperation, keysResult] = handlers.keys?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return keysResult
              }
              return Reflect.apply(Array.prototype.keys, target, [])
            }
          case "values":
            return () => {
              const [continueOperation, valuesResult] = handlers.values?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return valuesResult
              }
              return Reflect.apply(Array.prototype.values, target, [])
            }
          case "join":
            return (separator: string) => {
              const [continueOperation, joinResult] = handlers.join?.(target, separator) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return joinResult
              }
              return Reflect.apply(Array.prototype.join, target, [separator])
            }
          case "toString":
            return () => {
              const [continueOperation, toStringResult] = handlers.toStringHandler?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return toStringResult
              }
              return Reflect.apply(Array.prototype.toString, target, [])
            }
          case "toLocaleString":
            return () => {
              const [continueOperation, toLocaleStringResult] = handlers.toLocaleStringHandler?.(target) ?? [
                allowMutations,
                undefined,
              ]
              if (!continueOperation) {
                return toLocaleStringResult
              }
              return Reflect.apply(Array.prototype.toLocaleString, target, [])
            }

          default:
            if (typeof key === "number" || !isNaN(Number(key))) {
              const index = Number(key)
              const [cont, getResult] = handlers.getByIndex?.(target, index, receiver) ?? [allowMutations, undefined]
              if (!cont) {
                return getResult
              }
              return Reflect.get(target, index, receiver)
            } else {
              return Reflect.get(target, key, receiver)
            }
        }
      } else if (typeof key === "symbol") {
        switch (key) {
          case Symbol.iterator:
            return () => {
              const [continueOperation, result] = handlers[Symbol.iterator]?.(target) ?? [allowMutations, undefined]
              if (!continueOperation) {
                return result
              }
              return Reflect.apply(Array.prototype[Symbol.iterator], target, receiver)
            }
          default:
            return Reflect.get(target, key, receiver)
        }
      }
    },
  })
}
