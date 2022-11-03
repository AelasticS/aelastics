/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer , WhatToDo } from './Transformer'
import { Node } from '../common/Node'

/**
 *  NaturalReducer implements functionality needed for constructing a typed structure
 *   init - create an empty value
 *   step - insert a child to its parent structure
 *   result - return the received value without modifications
 */
export class NaturalReducer implements ITransformer {
  init(value: any , currNode: Node): [any , WhatToDo] {
    return [currNode.type.init(currNode) , 'continue']
  }

  result(result: any , currNode: Node): [any , WhatToDo] {
    return [ result, 'continue']
  }

  step(result: any , item: any , currNode: Node): [any , WhatToDo] {
    currNode.parent?.type.addChild(result , item , currNode)
    return [result , 'continue']
  }
}
