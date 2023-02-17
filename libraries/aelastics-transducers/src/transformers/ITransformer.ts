/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from 'aelastics-types'

export type WhatToDo = 'continue' | 'terminate' | 'skipChildren' | 'skipChild'

export interface ITransformer {
  init: (value: any , currNode: Node) => [any , WhatToDo]
  result: (result: any , currNode: Node) => [any , WhatToDo]
  step: (result: any , item: any , currNode: Node) => [any , WhatToDo]
}

export type Reducer<A> = (result: A, item: any, currNode: Node) => A

export const compose = (...fns: ((y: any) => any)[]) => (x: any) =>
  fns.reduceRight((y , f) => f(y) , x)
