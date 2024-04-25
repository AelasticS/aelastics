/*
 * Copyright (c) AelasticS 2020.
 */

import { IProcessor, WhatToDo } from './Transformer'
import { Node } from '../common/Node'
import { ServiceError } from 'aelastics-result'
import { getTypeInfo } from './FromDTOGraph'
import { System } from '../type/TypeSchema'

export class ToDTOGraph implements IProcessor {
  private xf: IProcessor

  constructor(xf: IProcessor) {
    this.xf = xf
  }

  private makeReference(node: Node): Object {
    let typeName = getTypeInfo(node.instance)
    let type = System.getType(typeName)
    if (type) {
      node.type = type
    }
    return {
      typeName: node.type.fullPathName,
      category: node.type.typeCategory,
      id: node.visited.newID(),
    }
  }

  private getReference(item: any): Object | undefined {
    return item['ref']
  }

  init(value: any, currNode: Node): [any, WhatToDo] {
    switch (currNode.type.typeCategory) {
      case 'String':
      case 'Boolean':
      case 'Date':
      case 'Number':
        return this.xf.init(value, currNode)
      case 'Object':
        // ToDo check subtyping
        let obj = { ref: this.makeReference(currNode), object: {} }
        return this.xf.init(obj, currNode)
      case 'Array':
        let arr = { ref: this.makeReference(currNode), array: [] }
        return this.xf.init(arr, currNode)
    }
    return this.xf.init(value, currNode)
  }

  step(result: any, currNode: Node, item: any): [any, WhatToDo] {
    //  if (result['@hasErrors'] === undefined)
    if (currNode.isRevisited) {
      let ref = this.getReference(item)
      if (ref === undefined) {
        throw new ServiceError(
          'InternalError',
          `Object reference is undefined for type '${currNode.type.fullPathName}'`
        )
      } else item = { ref: ref }
    }
    if (currNode.parent !== undefined) {
      switch (currNode.parent.type.typeCategory) {
        case 'Object':
          currNode.parent?.type.addChild(result['object'], item, currNode)
          break
        case 'Array':
          currNode.parent?.type.addChild(result['array'], item, currNode)
          break
      }
    }
    return this.xf.step(result, currNode, item)
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    return this.xf.result(result, currNode)
  }
}
