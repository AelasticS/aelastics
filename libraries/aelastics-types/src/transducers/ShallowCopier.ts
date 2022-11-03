/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer, WhatToDo } from './Transformer'
import { Node } from '../common/Node'
import { Transducer } from './Transducer'

/**
 *  ShallowCopier makes a shalow copy of a structure
 *   init - forward init
 *   step - forward step
 *   result - forward step
 */
export class ShallowCopier implements ITransformer {
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

  step(acc: any, item: any, currNode: Node): [any, WhatToDo] {
    return this.xf.step(acc, item, currNode)
  }
}
