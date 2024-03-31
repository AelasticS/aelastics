/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer, WhatToDo } from './Transformer'
import { Node } from '../common/Node'

export class Wrap implements ITransformer {
  private readonly initValue: any
  private readonly stepFn: ITransformer["step"]

  constructor(stepFn: (result: any, currNode: Node, item: any) => any, initValue?: any) {
    this.initValue = initValue
    this.stepFn = stepFn
  }

  init(currNode: Node, item: any): [any, WhatToDo] {
    if(this.initValue !== undefined)
      return [this.initValue, 'continue']
    else
      return [item, 'continue']
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    return [result, 'continue']
  }

  step(result: any, currNode: Node, item: any): [any, WhatToDo] {
    return [this.stepFn(result, currNode, item), 'continue']
  }
}
