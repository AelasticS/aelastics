/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer , WhatToDo } from './Transformer'
import { Node } from '../common/Node'

/**
 *   StepperReducer only do the step 
 *   init - return the received value without modifications
 *   step - insert a child to its parent structure
 *   result - return the received value without modifications
 */
export class StepperReducer implements ITransformer {
  init(value: any , currNode: Node): [any , WhatToDo] {
    return [value , 'continue']
  }
 
  result(result: any , currNode: Node): [any , WhatToDo] {
    return [ result, 'continue']
  }

  step(result: any , item: any , currNode: Node): [any , WhatToDo] {
    currNode.parent?.type.addChild(result , item , currNode)
    return [result , 'continue']
  }
}
