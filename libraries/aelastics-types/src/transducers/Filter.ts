/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer , WhatToDo } from './Transformer'
import { Node } from '../common/Node'

export class Filter implements ITransformer {
  private readonly predicate: (item: any , currNode: Node) => boolean
  private xf: ITransformer

  constructor(xf: ITransformer, predicate: (item: any , currNode: Node) => boolean) {
    this.predicate = predicate
    this.xf = xf
  }

  init(value: any , currNode: Node): [any , WhatToDo] {
    return this.xf.init(value , currNode)
  }

  result(result: any , currNode: Node): [any , WhatToDo] {
    return this.xf.result(result , currNode)
  }

  step(result: any , item: any , currNode: Node): [any , WhatToDo] {
    if (this.predicate(item , currNode)) return this.xf.step(result , item , currNode)
    else return [result , 'continue']
  }
}
