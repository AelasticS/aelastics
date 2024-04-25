/*
 * Copyright (c) AelasticS 2020.
 */


// TODO :  Serialization using annotations
//      annotations:  serialize: no| containment | reference
//
//    format: JSON, JSON_Extended
//    model export import 


import { IProcessor, WhatToDo } from './Processor'
import { Node } from '../common/Node'
import { InstanceReference } from '../type/TypeDefinisions'
import { System } from '../type/TypeSchema'
import { boolean } from '../common/DefinitionAPI'

export function getTypeInfo(obj: any): string {
  if (obj.ref) {
    return obj.ref.typeName as string
  }
  return obj['@@aelastics/type'] as string
}

export class FromDTOGraph implements IProcessor {
  private xf: IProcessor

  constructor(xf: IProcessor) {
    this.xf = xf
  }

  private getReference(item: any): InstanceReference | undefined {
    /*    if(ref === undefined && item['id'] !== undefined) {
          ref = item
        }*/
    if(typeof item === 'object' && item !== null)
      return item['ref']
    else
      return undefined
  }

  init(value: any, currNode: Node): [any, WhatToDo] {
    // ToDo check subtyping
    let ref: any = this.getReference(currNode.instance)
    let id = ref ? ref['id'] : 0
    let item = id > 0 ? currNode.visited.get([currNode.type, id]) : undefined
    if (item !== undefined) {
      return [item, 'skipChildren']
    }
    switch (currNode.type.typeCategory) {
      case 'Object':
        // ToDo create appropriate subtype
        //  change its type in currNode!?
        let typeName = getTypeInfo(currNode.instance)
        let type = System.getType(typeName)
        if (type) {
          currNode.type = type
        }
        // TODO:  is '@@aelastics/type' property needed?
        let obj = Object.defineProperty({}, '@@aelastics/type', {
          value: currNode.type.fullPathName,
          writable: true,
          enumerable: false,
          configurable: true,
        }) //{ '@type': currNode.type.fullPathName }
        currNode.visited.set([currNode.type, id], obj)
        currNode.instance = currNode.instance['object']
        return this.xf.init(obj, currNode)
      case 'Array':
        let arr = [] as any
        currNode.instance = currNode.instance['array']
        currNode.visited.set([currNode.type, id], arr)
        return this.xf.init(arr, currNode)
    }
    return this.xf.init(value, currNode)
  }

  step(result: any, currNode: Node, item: any): [any, WhatToDo] {
    if (currNode.type.isSimple()) {
      switch (currNode.type.typeCategory) {
        case 'Boolean':
          if(item === 'false')
             item = false
          else {
            item = !!item
          }
          break
        case 'Number':
            item = Number(item)
          break
        case 'String':
              item = item.toString()
          break
        case 'Date':
          item = new Date(item)
          break
      }
    }
    //  if (result['@hasErrors'] === undefined)
    if (currNode.parent !== undefined) {
      switch (currNode.parent.type.typeCategory) {
        case 'Object':
          currNode.parent?.type.addChild(result, item, currNode)
          break
        case 'Array':
          currNode.parent?.type.addChild(result, item, currNode)
          break
      }
    }
    else if(currNode.type.isSimple()) {
      result = item
    }
    return this.xf.step(result, currNode, item)
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    return this.xf.result(result, currNode)
  }
}
