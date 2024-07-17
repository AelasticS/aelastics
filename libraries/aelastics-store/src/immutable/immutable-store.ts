import * as t from "aelastics-types"
import { Class, createClass } from "./createClass"
import { OperationContext } from "./operation-context"
// import { immerable, produce, enableMapSet, Immer, Draft, produceWithPatches } from "immer"
import {
  ImmutableObject,
  checkJavascriptType,
  clone,
  context,
  isTypeEntity,
  objectUUID,
  shallowCloneObject,
} from "../common/CommonConstants"
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
 * Last Modified: Sunday, 26th May 2024
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

  private history: OperationContext<S>[] = []
  // private _state: S = null as S

  makeNewOperationContext(state?: S) {
    this.history.push(new OperationContext(state))
  }
  cloneOperationContext() {
    this.history.push(new OperationContext(this.getState(), this.getIdMap(), this.getIdMapWithDeleted()))
  }

  getContext(): OperationContext<S> {
    if (this.history.length > 0) return this.history[this.history.length - 1]
    else throw new Error("ImmutableStore has no created operation context. You should invoke createRoot() method!")
  }
  getState() {
    if (this.history.length > 0) return this.history[this.history.length - 1].state
    else throw new Error("ImmutableStore has no created state. You should invoke createRoot() method!")
  }
  getIdMap() {
    if (this.history.length > 0) return this.history[this.history.length - 1].idMap
    else throw new Error("ImmutableStore has no created state. You should invoke createRoot() method!")
  }
  getIdMapWithDeleted() {
    if (this.history.length > 0) return this.history[this.history.length - 1].deletedMap
    else throw new Error("ImmutableStore has no created state")
  }

  /**
   * Creates an instance of ImmutableStore.
   * @param {S} initialState - The initial state of the store.
   */
  constructor(readonly rootType: t.AnyObjectType) {}

  createRoot(initialState: S, ID?: string): S {
    this.history.push(new OperationContext())
    this.getContext().setState(this.newObject(this.rootType, initialState as t.ObjectLiteral, ID) as S)
    return this.getState()
  }

  /**
   * Creates a new object of the specified type and initializes it with provided properties.
   * @param {AnyObjectType} objectType - The type of the object to create.
   * @param {P} initProps - The initial properties of the object.
   * @returns {P} The newly created object.
   */
  newObject<P extends ImmutableObject>(objectType: t.AnyObjectType, initProps: t.ObjectLiteral, ID?: string): P {
    let c: Class<P> | undefined = this._classMap.get(objectType)

    if (c === undefined) {
      c = createClass(objectType, this)
      this._classMap.set(objectType, c)
    }
    const obj = this.getContext().createObject<P>(c, initProps, objectType, ID)
    return obj
  }

  /**
   * Applies a function to modify the store's state immutably.
   * @param {(draft: Draft<S>) => void} f - A function that receives the current state as a draft and modifies it.
   */
  produce(f: (draft: S) => void): S {
    // change the operation mode
    const oldMode = this.getContext().operationMode
    this.getContext().operationMode = "immutable"
    // apply f
    f(this.getState())
    // get a new version of the state
    const r = this.getNewVersionOfState()
    this.getContext().setState(r.object)
    this.getContext().operationMode = oldMode
    return this.getState()
  }

  private getNewVersionOfState() {
    function makeClone(res: IResult, store: ImmutableStore<unknown>) {
      const oldObject = res.object
      if (res.object[clone]) res.object = res.object[clone]
      else res.object = shallowCloneObject(res.object)
      res.cloned = true
      // update context
      res.object[context] = store.getContext()
      // delete clone in old object
      oldObject[clone] = undefined
      // Update IdMap in new object
      store.getIdMap().set(res.object[objectUUID], res.object)
    }

    const fInitObject: IProcessorInit = (value: ImmutableObject, currNode) => {
      let res: IResult = { object: currNode.instance, cloned: false }
      if (res.object.isUpdated) {
        makeClone(res, this)
      }
      return [res, "continue"]
    }

    const fStepObject: IProcessorStep = (value: IResult, currNode, item: IResult) => {
      function isChildEntity(child: any): boolean {
        return checkJavascriptType(child) === "object" && child[isTypeEntity]
      }

      if (item.cloned && !value.cloned) {
        // child is cloned, so make clone of parent too if it is not cloned already
        makeClone(value, this)
        // if child is not an entity then value.object needed to update its prop to point to new clone
        // otherwise, child is entity and no need to update value.object since ID of child is not changed
        if (!isChildEntity(item.object)) {
          value.object[currNode.extra.propName!] = item.object
        }
      }

      return [value, "continue"]
    }

    const fResultObject: IProcessorResult = (result: IResult, currNode) => {
      return [result, "continue"]
    }

    const fInitArray: IProcessorInit = (value: any, currNode) => {
      return [value, "continue"]
    }

    const fStepArray: IProcessorStep = (value: IResult, currNode, item) => {
      if (value.cloned) currNode.parent?.type.addChild(value.object, item, currNode)
      return [value, "continue"]
    }

    const fResultArray: IProcessorResult = (result: IResult, currNode) => {
      return [result, "continue"]
    }

    // create processor
    const newStateProcessor = new t.ProcessorBuilder()
      .onInit(
        new t.InitBuilder()
          .onTypeCategory("Object", fInitObject)
          // .onTypeCategory("Simple", fInitSimple)
          // .onTypeCategory("Array", fInit)
          // .onPredicate((value, currNode) => value === "Number", (v, c) => [v, "continue"])
          .build()
      )
      .onStep(
        new t.StepBuilder()
          .onTypeCategory("Object", fStepObject)
          // .onTypeCategory("Array", fStep)
          // .onTypeCategory("Simple", fStepSimple)
          .build()
      )
      .onResult(
        new t.ResultBuilder()
          .onTypeCategory("Object", fResultObject)
          // .onTypeCategory("Array", fResult)
          // .onTypeCategory("Simple", fResultSimple)
          .build()
      )
      .build()

    // make new operation context
    this.cloneOperationContext()

    // define transducer consisting of only newStateProcessor
    const tr = t.transducer().recurse("makeItem").do(newStateProcessor, "arg").doFinally(t.identityReducer())
    // run transducer
    const r = this.rootType.transduce<IResult>(tr, this.getState())
    return r
  }

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

  // // TODO: remove this method after testing.
  // /**
  //  * Retrieves the idMap of the store with all existing objects.
  //  * @returns {Map<string, any>} The current idMap.
  //  */
  // getIdMap(): Map<string, any> {
  //   return this.ctx.idMap
  // }
}

interface IResult {
  object: any
  cloned: boolean
}
