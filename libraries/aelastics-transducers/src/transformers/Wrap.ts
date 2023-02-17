/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer, WhatToDo } from './ITransformer'
import { Node } from 'aelastics-types'

export class Wrap implements ITransformer {
  private readonly initValue: any
  private readonly stepFn: (result: any, item: any, currNode: Node) => any

  constructor(stepFn: (result: any, item: any, currNode: Node) => any, initValue?: any) {
    this.initValue = initValue
    this.stepFn = stepFn
  }

  init(item: any, currNode: Node): [any, WhatToDo] {
    if(this.initValue !== undefined)
      return [this.initValue, 'continue']
    else
      return [item, 'continue']
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    return [result, 'continue']
  }

  step(result: any, item: any, currNode: Node): [any, WhatToDo] {
    return [this.stepFn(result, item, currNode), 'continue']
  }
}
