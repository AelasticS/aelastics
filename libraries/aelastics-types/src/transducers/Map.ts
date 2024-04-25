/*
 * Copyright (c) AelasticS 2020.
 */

import { IProcessor , WhatToDo } from './Transformer'
import { Node } from '../common/Node'

export class Map implements IProcessor {
  private readonly f: (item: any , currNode: Node) => any
  private xf: IProcessor

  constructor(xf: IProcessor, f: (item: any , currNode: Node) => any) {
    this.f = f
    this.xf = xf
  }

  init(value: any , currNode: Node): [any , WhatToDo] {
    return this.xf.init(value , currNode)
  }

  result(result: any , currNode: Node): [any , WhatToDo] {
    return this.xf.result(result , currNode)
  }

  step(result: any , currNode: Node, item: any): [any , WhatToDo] {
    return this.xf.step(result , currNode, this.f(item , currNode) )
  }
}
