/*
 * Copyright (c) AelasticS 2020.
 */

import { IProcessor, WhatToDo } from './Processor'
import { Node } from '../common/Node'

export class Wrap implements IProcessor {
  private readonly initValue: any
  private readonly stepFn: IProcessor["step"]

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
