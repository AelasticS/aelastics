import { AnyObjectType, ObjectLiteral, object } from "aelastics-types"
import { Class, createClass } from "./createClass"
import { OperationContext } from "./operation-context"
import { immerable, produce, enableMapSet } from "immer"
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

// TODO: implement immer inside the syncIdMapWithState function if needed.

class ImmerState {
  [immerable] = true
  constructor(readonly state: any) {}
}
interface IdentifiableItem {
  id: string
  [key: string]: any
}

export class ImmutableStore<S extends { [key: string]: IdentifiableItem[] }> {
  private _classMap = new Map<AnyObjectType, Class<ObjectLiteral>>()
  private _state: S
  ctx = new OperationContext()

  constructor(initialState: S) {
    this._state = initialState
  }

  newObject(objectType: AnyObjectType, initProps: Partial<ObjectLiteral> = {}): ObjectLiteral {
    let c = this._classMap.get(objectType)

    if (c === undefined) {
      c = createClass(objectType, this.ctx)
      this._classMap.set(objectType, c)
    }

    return this.ctx.createObject(c, initProps, objectType)
  }

  addObject(key: keyof S, object: any): void {
    if (Array.isArray(this._state[key])) {
      ;(this._state[key] as Array<any>).push(object)
    } else {
      throw new Error(`${key as string} is not an array or does not exist on state.`)
    }
  }

  /**
   *
   * idMap has to be part of the state for the producer
   * f should have access to state and store
   */
  // produce(f: (draft: S, store: ImmutableStore<S>) => void) {
  //   const { state, map } = produce(new ImmerState(this._state, this.ctx.idMap), (imm: ImmerState) => f(imm.state, this))
  //   this._state = state
  //   this.ctx.idMap = map
  // }

  // produce(f: (draft: any) => void): void {
  //   this._state = produce(this._state, f)
  // }

  produce(f: (draft: any) => void) {
    const { state } = produce(new ImmerState(this._state), (imm: ImmerState) => {
      f(imm.state)
    })
    this.ctx.idMap = this.syncIdMapWithState(state, this.ctx.idMap)
    this._state = state
  }

  syncIdMapWithState(state: any, map: any): Map<string, any> {
    for (const key of Object.keys(state)) {
      if (Array.isArray(state[key])) {
        state[key].forEach((item: any) => {
          if (item["@@aelastics/ID"] && map.has(item["@@aelastics/ID"])) {
            map.set(item["@@aelastics/ID"], item)
          }
        })
      }
    }
    return map
  }

  getState(): S {
    return this._state
  }
}
