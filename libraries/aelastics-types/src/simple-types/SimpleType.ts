import { ExtraInfo, Type } from '../type/Type'
import { Any } from '../common/DefinitionAPI'
import { Node } from '../common/Node'
import { IProcessor , WhatToDo } from '../transducers/Processor'

export abstract class SimpleType<V, G, T> extends Type<V, G, T> {
  isSimple(): boolean {
    return true
  }
/*  init(n: Node): V {
    return n.instance
  }*/

  addChild(parent: any, child: any, n: Node): void {}

  *children(i: V, n: Node): Generator<[V, Any, ExtraInfo]> {
 //   return [i, this, n.extra]
  }

  doTransformation<A>(
    t: IProcessor,
    input: V | Node,
    initObj?: A,
    resetAcc: boolean = false,
    typeLevel:boolean = false
  ): [A, WhatToDo] {
    /**
     *  no children, skip step, just do init i result
     */
    let acc = initObj
    let whatToDo: WhatToDo
    let n = Node.makeNode(input, this, initObj, undefined, undefined, typeLevel)
    if (resetAcc || acc === undefined) {
      ;[acc, whatToDo] = t.init(initObj, n)
    }
    ;[acc, whatToDo] = t.step(acc, n, n.instance)
    return whatToDo !== 'continue' ? [acc!, whatToDo] : (t.result(acc, n) as any)
  }
}

export type AnySimpleType = SimpleType<any, any, any>

