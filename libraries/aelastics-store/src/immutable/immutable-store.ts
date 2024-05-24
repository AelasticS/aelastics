import * as t from "aelastics-types"
import { Class, createClass } from "./createClass"
import { OperationContext } from "./operation-context"
// import { immerable, produce, enableMapSet, Immer, Draft, produceWithPatches } from "immer"
import {ImmutableObject } from "../common/CommonConstants"
import { IProcessorInit, IProcessorResult, IProcessorStep } from "aelastics-types/lib/transducers"
// enableMapSet()
/*
 * Project: aelastics-store
 * Created Date: Monday July 10th 2023
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Friday, 24th May 2024
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2024 Aelastics (https://github.com/AelasticS)
 */

/**
 * Implements an immutable state management store using Immer library to handle state updates immutably.
 * The store supports objects that are identifiable by unique IDs ("@@aelastics/ID").
 */
export class ImmutableStore<S> {



  private _classMap = new Map<t.AnyObjectType, Class<any>>()
  private _state: S
  ctx = new OperationContext()
  private _toDeleteIDs: string[] = []

  getState() {
    return this._state
  }
  
  getIdMap() {
    return this.ctx.idMap
  }
  getIdMapWithDeleted() {
    return this.ctx.deletedMap
  }

  /**
   * Creates an instance of ImmutableStore.
   * @param {S} initialState - The initial state of the store.
   */
  constructor(initialState: S, readonly type:t.AnyObjectType) {
    this._state = initialState
  }

  /**
   * Creates a new object of the specified type and initializes it with provided properties.
   * @param {AnyObjectType} objectType - The type of the object to create.
   * @param {P} initProps - The initial properties of the object.
   * @returns {P} The newly created object.
   */
  newObject<P extends ImmutableObject>(objectType: t.AnyObjectType, initProps: t.ObjectLiteral): P {
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
  produce(f: (draft: S) => void) {
    // apply f
    f(this._state)
    // make a new version of the state

  }


private makeNewStateVersion() {

  interface IResult {object:any, makeCopy:boolean}
  const shouldMakeCopy = (obj:ImmutableObject):boolean => {
    return obj.isUpdated
  }

  const fInit:IProcessorInit = (value:ImmutableObject,currNode) => {
    let res:IResult = {object:currNode.instance, makeCopy:false}
    if(shouldMakeCopy(value))
      res.makeCopy=true
    return [value, "continue"];
  }

  const fStep:IProcessorStep = (value:IResult,currNode, item) => {
      return [value, "continue"];
  }

  const fResult:IProcessorResult = (result:IResult,currNode) => {
    return [result, "continue"];
  }


  let newStateProcessor = new t.ProcessorBuilder()
      .onInit(
        new t.InitBuilder()
          .onTypeCategory("Object", (fInit))
          // .onTypeCategory("Array", fInit)
          // .onTypeCategory("Simple", fInit)
          // .onPredicate((value, currNode) => value === "Number", (v, c) => [v, "continue"])
          .build()
      )
      .onStep(
        new t.StepBuilder()
          .onTypeCategory("Object", fStep)
          // .onTypeCategory("Array", fStep)
          // .onTypeCategory("Number", fStep)
          // .onTypeCategory("Simple", fStep)
          .build()
      )
      .onResult(
        new t.ResultBuilder()
          .onTypeCategory("Object", fResult)
          // .onTypeCategory("Array", fResult)
          // .onTypeCategory("Number", fResult)
          // .onTypeCategory("Simple", fResult)
          .build()
      )
      .build();
    let tr = t.transducer()
      .recurse("makeItem")
      .do(newStateProcessor, "arg")
    .doFinally(t.identityReducer());
    let r = this.type.transduce(tr, this.getState);
}
  // produce(f: (draft: Draft<S>) => void) {
  //   const [result, patches, inversePatches] = produceWithPatches(this._state, (draft) => {
  //     f(draft)
  //   })

  //   patches.forEach((patch) => {
  //     switch (patch.op) {
  //       case "remove":
  //         // Use the path to find the aelastics object in this._state, and delete it from the ID map
  //         let ref = this._state as any
  //         patch.path.forEach((key) => {
  //           ref = ref[key]
  //         })

  //         // If ref is an aelastics object, delete it from the ID map
  //         if (ref && ref["@@aelastics/ID"]) {
  //           this.ctx.deleteObject(ref)
  //         }

  //         break
  //     }
  //   })

  //   this._state = result
  //   this.syncIdMapWithState(this._state, this.ctx.idMap)
  // }

  // /**
  //  * Updates the idMap with the new state. Stack based iteration is used to traverse the state object.
  //  * @param state - The new state.
  //  * @param {Map<string, any>} map - The idMap to update.
  //  */
  // private syncIdMapWithState(state: any, map: Map<string, any>) {
  //   if (state === null || typeof state !== "object") return

  //   const stack = [state]

  //   while (stack.length > 0) {
  //     const current = stack.pop()

  //     if (current && typeof current === "object") {
  //       // Check if the current object has an ID
  //       if (current["@@aelastics/ID"]) {
  //         const itemId = current["@@aelastics/ID"]
  //         if (itemId && (!map.has(itemId) || !Object.is(map.get(itemId), current))) {
  //           map.set(itemId, current)
  //         }
  //       }

  //       // Add properties of the current object to the stack
  //       for (const key in current) {
  //         if (Object.hasOwnProperty.call(current, key)) {
  //           stack.push(current[key])
  //         }
  //       }
  //     } else if (Array.isArray(current)) {
  //       // If the current element is an array, add its elements to the stack
  //       stack.push(...current)
  //     }
  //   }
  // }

  // // private updateIdMap(state: any, map: Map<string, any>) {
  // //   if (state === null) throw new Error("Cannot update null state.")
  // //   if (typeof state === "object" && Object.keys(state).includes("@@aelastics/ID")) {
  // //     const itemId = state["@@aelastics/ID"]
  // //     if (itemId && (!map.has(itemId) || !Object.is(map.get(itemId), state))) {
  // //       map.set(itemId, state)
  // //     }
  // //   } else if (typeof state === "object" && Object.keys(state).length) {
  // //     for (const key of Object.keys(state)) {
  // //       this.updateIdMap(state[key], map)
  // //     }
  // //   } else if (Array.isArray(state) && state.length) {
  // //     state.forEach((entry) => {
  // //       this.updateIdMap(entry, map)
  // //     })
  // //   }
  // // }

  // /**
  //  * Retrieves the current state of the store.
  //  * @returns {S} The current state.
  //  */
  // getState(): S {
  //   return this._state
  // }

  // // TODO: remove this method after testing.
  // /**
  //  * Retrieves the idMap of the store with all existing objects.
  //  * @returns {Map<string, any>} The current idMap.
  //  */
  // getIdMap(): Map<string, any> {
  //   return this.ctx.idMap
  // }

  // // TODO: remove this method after testing.
  // /**
  //  * Retrieves the idMap of the store with all deleted objects.
  //  * @returns {Map<string, any>} The current idMap.
  //  */
  // getIdMapWithDeleted(): Map<string, any> {
  //   return this.ctx.deletedMap
  // }
}
