/*
 * Copyright (c) AelasticS 2020.
 */

import { IProcessor , WhatToDo } from './Transformer'
import { Node } from '../common/Node'
import { isFailure } from 'aelastics-result'

export class Validation implements IProcessor {
  private xf: IProcessor

  constructor(xf: IProcessor) {
    this.xf = xf
  }

  private doValidation(result: any , item: any , currNode: Node): any {
    let res = currNode.type.checkValidators(item)
    if (isFailure(res)) {
      if (currNode.type.isSimple()) {
        item = {}
      }
      if (item['@hasErrors'] === undefined || item['@errors'] === undefined) {
        item['@hasErrors'] = true
        item['@errors'] = res.errors
      } else {
        item['@errors'] = [...item['@errors'] , ...res.errors]
      }
      if (typeof result === 'object' && result !== null) {
        if (result['@hasErrors'] === undefined) {
          result['@hasErrors'] = true
          result['@errors'] = []
        }
      }
    }
    return item
  }

  init(value: any , currNode: Node): [any , WhatToDo] {
    if(currNode.type.isSimple())
      return  [currNode.instance,'continue']
    return this.xf.init(value , currNode)
  }

  step(result: any , currNode: Node, item: any): [any , WhatToDo] {
    let newItem = this.doValidation(result , item , currNode)
    return this.xf.step(result , currNode, newItem)
/*
    if (result['@hasErrors'] === undefined) return this.xf.step(result , item , currNode)
    else {
      currNode.parent?.type.addChild(result , newItem , currNode)
      return [result , 'continue']
    }*/
  }

  result(result: any , currNode: Node): [any , WhatToDo] {
    if (currNode.extra.role === 'asRoot') {
      let r = this.doValidation(result , result , currNode)
      return this.xf.result(r , currNode)
/*
      // ToDo verify to call next result
      if (r['@hasErrors'] === undefined) return this.xf.result(r , currNode)
      else return [r , 'continue']*/
    }
    else return this.xf.result(result , currNode)

  }
}
