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
 * Implements an immutable state management store using Immer library to handle state updates immutably.
 * The store supports objects that are identifiable by unique IDs ("@@aelastics/ID").
 */
class ImmerState {
  [immerable] = true
  constructor(readonly state: any) {}
}

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
   * @param {(draft: any) => void} f - A function that receives the current state as a draft and modifies it.
   */
  produce(f: (draft: Draft<S>) => void) {
    this._state = produce(this._state, (draft) => {
      f(draft)
    })
    this.ctx.idMap = this.syncIdMapWithState(this._state, this.ctx.idMap)
  }

  /**
   * Synchronizes the identity map with the current state immutably using Immer.
   * @param {any} state - The current state of the store.
   * @param {Map<string, any>} map - The existing map of IDs to objects.
   * @returns {Map<string, any>} The updated map immutably.
   */
  syncIdMapWithState(state: any, map: Map<string, any>): Map<string, any> {
    return produce(map, (draftMap) => {
      this.updateIdMap(state, draftMap)
    })
  }

  private updateIdMap(state: any, map: Map<string, any>) {
    if (state === null) throw new Error("Cannot update null state.")
    if (typeof state === "object" && Object.keys(state).includes("@@aelastics/ID")) {
      const itemId = state["@@aelastics/ID"]
      if (itemId && (!map.has(itemId) || !Object.is(map.get(itemId), state))) {
        map.set(itemId, state)
      }
    } else if (typeof state === "object" && Object.keys(state).length) {
      for (const key of Object.keys(state)) {
        this.updateIdMap(state[key], map)
      }
    } else if (Array.isArray(state) && state.length) {
      state.forEach((entry) => {
        this.updateIdMap(entry, map)
      })
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
