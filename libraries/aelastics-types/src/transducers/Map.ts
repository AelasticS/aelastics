/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer , WhatToDo } from './Transformer'
import { Node } from '../common/Node'

export class Map implements ITransformer {
  private readonly f: (item: any , currNode: Node) => any
  private xf: ITransformer

  constructor(xf: ITransformer, f: (item: any , currNode: Node) => any) {
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
