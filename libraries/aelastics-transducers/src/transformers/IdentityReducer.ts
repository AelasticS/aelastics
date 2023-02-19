/*
 * Copyright (c) AelasticS 2020.
 */

 /**
 *  IdentityReducer do nothing, just return wht it receive 
 *   init - return the received value without modifications
 *   step - return the received value without modifications
 *   result - return the received value without modifications
 */ 
import { ITransformer , WhatToDo } from './ITransformer'
import { Node } from 'aelastics-types'

export class IdentityReducer implements ITransformer {
  init(value: any , currNode: Node): [any , WhatToDo] {
    return [value , 'continue']
  }

  result(result: any , currNode: Node): [any , WhatToDo] {
    return [result , 'continue']
  }

  step(result: any , item: any , currNode: Node): [any , WhatToDo] {
    return [result , 'continue']
  }
}
