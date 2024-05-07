import { AnyObjectType, ObjectLiteral, object } from "aelastics-types"
import { Class, createClass } from "./createClass"
import { OperationContext } from "./operation-context"
import { immerable, produce } from "immer"
import { urlToHttpOptions } from "url"

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
  // mapping created classes - works as a way of caching already existing types
  private _classMap = new Map<AnyObjectType, Class<ObjectLiteral>>()
  ctx = new OperationContext()
  private _state: S

  //state is an object and cannot be an array ( TODO: we can test with arrays in the future)
  constructor(type: AnyObjectType, initialState: S) {
    this._state = this.newObject(type, initialState)
  }

  newObject<P extends ObjectLiteral>(objectType: AnyObjectType, initProps: P): P {
    let c = this._classMap.get(objectType)

    if (c === undefined) {
      c = createClass(objectType, this.ctx)
      this._classMap.set(objectType, c)
    }

    return this.ctx.createObject(c, initProps, objectType)
  }

  // newObject2 = function <P extends ObjectLiteral>(arg: P): P {
  //   return arg
  // }

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
