/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer, WhatToDo } from './Transformer'
import { Node } from '../common/Node'
import { Transducer } from './Transducer'

export class RecursiveTransformer implements ITransformer {
  transducer: Transducer
  xf: ITransformer
  resetAcc: boolean

  constructor(xf: ITransformer, t: Transducer, resetAcc: boolean) {
    this.transducer = t
    this.xf = xf
    this.resetAcc = resetAcc
  }

  init(value: any, currNode: Node): [any, WhatToDo] {
    return this.xf.init(value, currNode)
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    return this.xf.result(result, currNode)
  }

  /* visitedNodes
   *  1. validate
   *      key = [type,input], value = acc // created instance with errors
   *  2. toDTO
   *      key = [type,input], value = RFI // part of acc
   *  3. fromDTO
   *      key = [type,RFI], value = acc // created instance
   * 4. reduce - accumulated mode is mandatory!
   *    key = [type, input], value = 0/init/neutral element // should not contribute two times
   */
  step(acc: any, currNode: Node, item: any): [any, WhatToDo] {
    // ToDo should use defaultReducer for the childType? instead of wrapping
    if (!currNode.type.isSimple() && this.transducer.reducer) {
      let [res, whatToDo] = currNode.type.doTransformation(
        this.transducer.reducer,
        currNode,
        acc,
        this.resetAcc
      )
      if (whatToDo !== 'continue') return [res, whatToDo]
      if (this.resetAcc) {
        // ToDo change currNode.instance to a new item or keep old original one ???
        // currNode.instance = res
        return this.xf.step(acc, currNode, res) // makeItem mode => res is a new item, acc is a container
      } else {
        currNode.acc = res
        return this.xf.step(res, currNode, item) // accumulate mode => res is accumulated value
      }
    } else return this.xf.step(acc, currNode, item)
  }
}
