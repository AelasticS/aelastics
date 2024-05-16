import { AnyObjectType, ObjectLiteral } from "aelastics-types"
import { Class, createClass } from "./createClass"
import { OperationContext } from "./operation-context"
import { immerable, produce, enableMapSet, Immer, Draft } from "immer"
import { IImmutableStoreObject, ImmerableObjectLiteral } from "../common/CommonConstants"
enableMapSet()
/*
 * Project: aelastics-store
 * Created Date: Monday July 10th 2023
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

/**
 * Represents the state of the store that can be modified immutably.
 */
class ImmerState<S> {
  [immerable] = true
  constructor(readonly state: S) {}
}

/**
 * Implements an immutable state management store using Immer library to handle state updates immutably.
 * The store supports objects that are identifiable by unique IDs ("@@aelastics/ID").
 */
export class ImmutableStore<S> {
  private _classMap = new Map<AnyObjectType, Class<any>>()
  private _state: S
  ctx = new OperationContext()

  /**
   * Creates an instance of ImmutableStore.
   * @param {S} initialState - The initial state of the store.
   */
  constructor(initialState: S) {
    this._state = initialState
  }

  /**
   * Creates a new object of the specified type and initializes it with provided properties.
   */
  newObject<P extends ImmerableObjectLiteral>(objectType: AnyObjectType, initProps: P): P {
    let c: Class<P> | undefined = this._classMap.get(objectType)

    if (c === undefined) {
      c = createClass(objectType, this.ctx)
      this._classMap.set(objectType, c)
    }
    const obj = this.ctx.createObject<P>(c, initProps, objectType)
    return obj
  }

  /**
   * Applies a function to modify the store's state immutably.
   * @param {(draft: Draft<S>) => void} f - A function that receives the current state as a draft and modifies it.
   */
  produce(f: (draft: Draft<S>) => void) {
    const result = produce(new ImmerState(this._state), (draft) => {
      f(draft.state)
      // this.updateIdMap(draft.state, draft.idMap) -  this is commented, in case we want our idMap to be immutable as well
    })

    this._state = result.state
    // this.ctx.idMap = result.idMap -  this is commented, in case we want our idMap to be immutable as well

    // Update the idMap with the new state
    this.updateIdMap(this._state, this.ctx.idMap)
  }

  // private updateIdMap(state: any, map: Map<string, any>) {
  //   if (state === null) throw new Error("Cannot update null state.")
  //   if (typeof state === "object" && Object.keys(state).includes("@@aelastics/ID")) {
  //     const itemId = state["@@aelastics/ID"]
  //     if (itemId && (!map.has(itemId) || !Object.is(map.get(itemId), state))) {
  //       map.set(itemId, state)
  //     }
  //   } else if (typeof state === "object" && Object.keys(state).length) {
  //     for (const key of Object.keys(state)) {
  //       this.updateIdMap(state[key], map)
  //     }
  //   } else if (Array.isArray(state) && state.length) {
  //     state.forEach((entry) => {
  //       this.updateIdMap(entry, map)
  //     })
  //   }
  // }

  /**
   * Updates the idMap with the new state. Stack based iteration is used to traverse the state object.
   * @param state - The new state.
   * @param {Map<string, any>} map - The idMap to update.
   */
  private updateIdMap(state: any, map: Map<string, any>) {
    if (state === null || typeof state !== "object") return

    const stack = [state]

    while (stack.length > 0) {
      const current = stack.pop()

      if (current && typeof current === "object") {
        // Check if the current object has an ID
        if (current["@@aelastics/ID"]) {
          const itemId = current["@@aelastics/ID"]
          if (itemId && (!map.has(itemId) || !Object.is(map.get(itemId), current))) {
            map.set(itemId, current)
          }
        }

        // Add properties of the current object to the stack
        for (const key in current) {
          if (Object.hasOwnProperty.call(current, key)) {
            stack.push(current[key])
          }
        }
      } else if (Array.isArray(current)) {
        // If the current element is an array, add its elements to the stack
        stack.push(...current)
      }
    }
  }

  /**
   * Retrieves the current state of the store.
   * @returns {S} The current state.
   */
  getState(): S {
    return this._state
  }

  // TODO: remove this method after testing.
  /**
   * Retrieves the idMap of the store with all existing objects.
   * @returns {Map<string, any>} The current idMap.
   */
  getIdMap(): Map<string, any> {
    return this.ctx.idMap
  }
}
