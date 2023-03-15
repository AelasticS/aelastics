/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from '../common/Node'

export type WhatToDo = 'continue' | 'terminate' | 'skipChildren' | 'skipChild'

export interface ITransformer {
  init (value: any , currNode: Node, ...args:any[]) : [any , WhatToDo]
  result (result: any , currNode: Node, ...args:any[]) : [any , WhatToDo]
  step (result: any , item: any , currNode: Node, ...args:any[]) : [any , WhatToDo]
}
export type TransformerClass = { new (xfNext: ITransformer, ...args: any[]): ITransformer  }

export type Reducer<A> = (result: A, item: any, currNode: Node) => A

export const compose = (...fns: ((y: any) => any)[]) => (x: any) =>
  fns.reduceRight((y , f) => f(y) , x)
