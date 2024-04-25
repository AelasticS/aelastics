/*
 * Copyright (c) AelasticS 2020.
 */

import { IProcessor , WhatToDo } from './Transformer'
import { Node } from '../common/Node'

export class Filter implements IProcessor {
  private readonly predicate: (item: any , currNode: Node) => boolean
  private xf: IProcessor

  constructor(xf: IProcessor, predicate: (item: any , currNode: Node) => boolean) {
    this.predicate = predicate
    this.xf = xf
  }

  init(value: any , currNode: Node): [any , WhatToDo] {
    return this.xf.init(value , currNode)
  }

  result(result: any , currNode: Node): [any , WhatToDo] {
    return this.xf.result(result , currNode)
  }

  step(result: any , currNode: Node, item: any): [any , WhatToDo] {
    if (this.predicate(item , currNode)) return this.xf.step(result , currNode, item)
    else return [result , 'continue']
  }
}
