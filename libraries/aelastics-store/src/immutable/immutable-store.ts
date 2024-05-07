import { AnyObjectType, ObjectLiteral, object } from "aelastics-types"
import { Class, createClass } from "./createClass"
import { OperationContext } from "./operation-context"
import { immerable, produce } from "immer"

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
export class ImmutableStore<S extends ObjectLiteral> {
  private _classMap = new Map<AnyObjectType, Class<ObjectLiteral>>()
  ctx = new OperationContext()
  private _state: S

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

  produce(f: (draft: S, store: ImmutableStore<S>) => void) {
    const { state, map } = produce(new ImmerState(this._state, this.ctx.idMap), (imm: ImmerState) => f(imm.state, this))
    this._state = state
    this.ctx.idMap = map
  }

  getState() {
    return this._state
  }
}

//map has to be part of the state for the producer
// f should have access to state and store

class ImmerState {
  [immerable] = true
  constructor(readonly state: any, readonly map: Map<string, any>) {}
}
