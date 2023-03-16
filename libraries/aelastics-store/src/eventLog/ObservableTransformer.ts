/*
 * Copyright (c) AelasticS 2020.
 */

import { ITransformer, WhatToDo, Node } from 'aelastics-types'
import { observable } from 'mobx'
// import { handleProps } from './HandleProps'

export class ObjectObservable implements ITransformer {
  private xf: ITransformer

  constructor(xf: ITransformer) {
    this.xf = xf
  }

  init(value: any, currNode: Node): [any, WhatToDo] {
    switch (currNode.type.typeCategory) {
      case 'Object':
          value = observable({})
        break
      case 'Array':
          value = observable([])
        break
      case 'Map':
          value = observable(new Map())
        break
      case 'Union':
      case 'TaggedUnion':
      case 'Intersection':
        value = observable({})
        break
    }
    return this.xf.init(value, currNode)
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    switch (currNode.type.typeCategory) {
      case 'Object':
     //   result = handleProps(result, currNode.type)
        break
    }
    return this.xf.result(result, currNode)
  }

  step(result: any, currNode: Node, item: any): [any, WhatToDo] {
    return this.xf.step(result, currNode, item)
  }
}

const prepareForMobX = (xf: ITransformer) => new ObjectObservable(xf)
