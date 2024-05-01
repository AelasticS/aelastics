import { AnyObjectType, ObjectLiteral, object } from "aelastics-types"
import { Class, createClass } from "./createClass"
import { OperationContext } from "./operation-context"

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
export class ImmutableStore {
  // mapping created classes - works as a way of caching already existing types
  private _classMap = new Map<AnyObjectType, Class<ObjectLiteral>>()
  ctx = new OperationContext()

  newObject(objectType: AnyObjectType, initProps: Partial<ObjectLiteral> = {}): ObjectLiteral {
    let c = this._classMap.get(objectType)

    if (c === undefined) {
      c = createClass(objectType, this.ctx)
      this._classMap.set(objectType, c)
    }

    return this.ctx.createObject(c, initProps, objectType)
  }

  // produce(f: (draft: State) => void) {
  //     this.currentState = produce(this.currentState, f);
  // }
}
